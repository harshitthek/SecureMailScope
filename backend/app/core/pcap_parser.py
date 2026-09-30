from dataclasses import dataclass
from typing import List, Dict, Tuple
from scapy.all import rdpcap, TCP, IP
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

    streams_raw: Dict[Tuple[str, int, str, int], List] = {}

    for pkt in packets:
        if IP in pkt and TCP in pkt:
            src_ip = pkt[IP].src
            dst_ip = pkt[IP].dst
            src_port = pkt[TCP].sport
            dst_port = pkt[TCP].dport

            if src_port in email_ports or dst_port in email_ports:
                # Normalize tuple so both directions go to same stream
                if (src_ip, src_port, dst_ip, dst_port) in streams_raw:
                    key = (src_ip, src_port, dst_ip, dst_port)
                elif (dst_ip, dst_port, src_ip, src_port) in streams_raw:
                    key = (dst_ip, dst_port, src_ip, src_port)
                else:
                    # Client is typically the one with the non-standard port
                    if dst_port in email_ports:
                        key = (src_ip, src_port, dst_ip, dst_port)
                    else:
                        key = (dst_ip, dst_port, src_ip, src_port)
                
                if key not in streams_raw:
                    streams_raw[key] = []
                streams_raw[key].append(pkt)

    streams_result = []
    stream_id = 0

    for key, pkt_list in streams_raw.items():
        if not pkt_list:
            continue
            
        client_ip, client_port, server_ip, server_port = key
        
        # Determine protocol
        proto = port_to_proto.get(server_port, 'UNKNOWN')
        is_implicit = server_port in implicit_tls_ports

        client_pkts = [p for p in pkt_list if p[IP].src == client_ip]
        server_pkts = [p for p in pkt_list if p[IP].src == server_ip]

        # Sort by sequence number
        client_pkts.sort(key=lambda p: p[TCP].seq)
        server_pkts.sort(key=lambda p: p[TCP].seq)

        # Reassemble
        client_payload = b"".join(bytes(p[TCP].payload) for p in client_pkts if p[TCP].payload)
        server_payload = b"".join(bytes(p[TCP].payload) for p in server_pkts if p[TCP].payload)

        try:
            ts = datetime.fromtimestamp(float(pkt_list[0].time)).isoformat()
        except:
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
