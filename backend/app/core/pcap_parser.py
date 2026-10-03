from dataclasses import dataclass
from typing import List, Dict, Tuple
from scapy.all import rdpcap, TCP, IP, IPv6
from datetime import datetime

@dataclass
class StreamData:
    stream_id: int
    src_ip: str
    src_port: int
    dst_ip: str
    dst_port: int
    protocol: str
    is_implicit_tls: bool
    client_payload: bytes
    server_payload: bytes
    timestamp: str
    packet_count: int

def _get_ips(pkt) -> tuple[str, str] | None:
    """Extract src and dst IP handling dual-stack IPv4 and IPv6."""
    if IP in pkt:
        return pkt[IP].src, pkt[IP].dst
    if IPv6 in pkt:
        return pkt[IPv6].src, pkt[IPv6].dst
    return None

def reassemble_tcp_payload(packets: list) -> bytes:
    """
    Reassemble TCP segment payloads handling retransmissions and segment overlaps.
    """
    if not packets:
        return b""
    
    segments = []
    for pkt in packets:
        if TCP in pkt and pkt[TCP].payload:
            payload = bytes(pkt[TCP].payload)
            if payload:
                seq = int(pkt[TCP].seq)
                time_val = float(pkt.time) if hasattr(pkt, "time") else 0.0
                segments.append((seq, time_val, payload))
    
    if not segments:
        return b""
        
    # Sort primarily by sequence number, secondarily by packet timestamp
    segments.sort(key=lambda s: (s[0], s[1]))
    
    reassembled = bytearray()
    last_seq = None
    
    for seq, _, payload in segments:
        if last_seq is None:
            reassembled.extend(payload)
            last_seq = seq + len(payload)
        else:
            if seq >= last_seq:
                reassembled.extend(payload)
                last_seq = seq + len(payload)
            elif seq + len(payload) > last_seq:
                # Partial overlap from retransmitted slice
                overlap = last_seq - seq
                reassembled.extend(payload[overlap:])
                last_seq = seq + len(payload)
            else:
                # Full duplicate / retransmission: ignore
                pass
                
    return bytes(reassembled)

def parse_pcap(file_path: str) -> list[StreamData]:
    """Reads a PCAP file, filters email protocols, and reassembles TCP streams."""
    try:
        packets = rdpcap(file_path)
    except Exception as e:
        print(f"Error reading pcap: {e}")
        return []

    email_ports = {25, 110, 143, 465, 587, 993, 995}
    port_to_proto = {
        25: 'SMTP',
        587: 'SMTP',
        465: 'SMTPS',
        143: 'IMAP',
        993: 'IMAPS',
        110: 'POP3',
        995: 'POP3S'
    }
    implicit_tls_ports = {465, 993, 995}

    # Group packets into conversation streams
    streams_raw: Dict[Tuple[str, int, str, int], List] = {}

    for pkt in packets:
        if (IP in pkt or IPv6 in pkt) and TCP in pkt:
            ips = _get_ips(pkt)
            if not ips:
                continue
            src_ip, dst_ip = ips
            src_port = int(pkt[TCP].sport)
            dst_port = int(pkt[TCP].dport)

            if src_port in email_ports or dst_port in email_ports:
                # Direction-invariant stream key (canonical pair)
                pair1 = (src_ip, src_port, dst_ip, dst_port)
                pair2 = (dst_ip, dst_port, src_ip, src_port)
                
                if pair1 in streams_raw:
                    streams_raw[pair1].append(pkt)
                elif pair2 in streams_raw:
                    streams_raw[pair2].append(pkt)
                else:
                    # Determine client vs server orientation for initial key
                    # Check for TCP SYN (without ACK)
                    tcp_flags = pkt[TCP].flags
                    is_syn_init = bool(tcp_flags & 0x02) and not bool(tcp_flags & 0x10)
                    
                    if is_syn_init:
                        canonical_key = pair1
                    elif dst_port in email_ports and src_port not in email_ports:
                        canonical_key = pair1
                    elif src_port in email_ports and dst_port not in email_ports:
                        canonical_key = pair2
                    else:
                        canonical_key = pair1
                    
                    streams_raw[canonical_key] = [pkt]

    streams_result = []
    stream_id = 1  # 1-indexed for forensic clarity

    for key, pkt_list in streams_raw.items():
        if not pkt_list:
            continue
            
        ip_a, port_a, ip_b, port_b = key
        
        # Determine actual client and server roles from the stream's packets
        client_ip, client_port = ip_a, port_a
        server_ip, server_port = ip_b, port_b
        
        # Role refinement: check for SYN flag initiation in packet history
        client_identified = False
        for p in pkt_list:
            if TCP in p and (IP in p or IPv6 in p):
                flags = p[TCP].flags
                if bool(flags & 0x02) and not bool(flags & 0x10):
                    ips = _get_ips(p)
                    if ips:
                        client_ip, server_ip = ips
                        client_port = int(p[TCP].sport)
                        server_port = int(p[TCP].dport)
                        client_identified = True
                        break
        
        if not client_identified:
            # Fall back to well-known service port convention
            if port_a in email_ports and port_b not in email_ports:
                client_ip, client_port = ip_b, port_b
                server_ip, server_port = ip_a, port_a
            elif port_b in email_ports and port_a not in email_ports:
                client_ip, client_port = ip_a, port_a
                server_ip, server_port = ip_b, port_b

        # Determine protocol & TLS mode
        proto = port_to_proto.get(server_port, 'UNKNOWN')
        if proto == 'UNKNOWN':
            # Check client port if server port was non-standard
            proto = port_to_proto.get(client_port, 'UNKNOWN')
            
        is_implicit = server_port in implicit_tls_ports or client_port in implicit_tls_ports

        client_pkts = [p for p in pkt_list if _get_ips(p) and _get_ips(p)[0] == client_ip]
        server_pkts = [p for p in pkt_list if _get_ips(p) and _get_ips(p)[0] == server_ip]

        # Robust TCP payload reassembly with deduplication
        client_payload = reassemble_tcp_payload(client_pkts)
        server_payload = reassemble_tcp_payload(server_pkts)

        try:
            ts = datetime.fromtimestamp(float(pkt_list[0].time)).isoformat()
        except Exception:
            ts = ""

        sd = StreamData(
            stream_id=stream_id,
            src_ip=client_ip,
            src_port=client_port,
            dst_ip=server_ip,
            dst_port=server_port,
            protocol=proto,
            is_implicit_tls=is_implicit,
            client_payload=client_payload,
            server_payload=server_payload,
            timestamp=ts,
            packet_count=len(pkt_list)
        )
        streams_result.append(sd)
        stream_id += 1

    return streams_result
