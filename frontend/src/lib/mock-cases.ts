import { StreamForensicInspection } from "./types";

export const CASE_1_INSPECTION: StreamForensicInspection = {
  state_timeline: [
    { step: 1, phase: "TCP_ESTABLISHED", direction: "C->S", summary: "3-Way TCP Handshake completed on SMTPS Port 465 (SYN -> SYN-ACK -> ACK)", status: "normal" },
    { step: 2, phase: "TLS_RECORD_INIT", direction: "C->S", summary: "ClientHello with Supported Versions [0x0304] TLS 1.3 & KeyShare X25519", is_transition_point: true, status: "secure" },
    { step: 3, phase: "TLS_RECORD_SERVER", direction: "S->C", summary: "ServerHello selects TLS 1.3 and 0x1301 (TLS_AES_256_GCM_SHA384)", is_transition_point: true, status: "secure" },
    { step: 4, phase: "CERT_VERIFY", direction: "S->C", summary: "Server Certificate & Verify handshake encrypted with ECDSA P-384", status: "secure" },
    { step: 5, phase: "APPLICATION_DATA", direction: "C->S", summary: "Encrypted SMTPS Envelope and payload transit with forward secrecy", status: "secure" },
  ],
  raw_chunks: [
    { offset: "0000", hex: "16 03 03 00 d8 01 00 00 d4 03 03 e2 10 9a b7 4f", ascii: "...............O", direction: "C->S", protocol_phase: "TLS 1.3 ClientHello", is_transition_point: true, highlight_label: "TLS 1.3 Client Record (0x16 0x03 0x03)", highlight_type: "secure" },
    { offset: "0010", hex: "6b 29 8c 1e fa 44 20 b1 c9 80 00 20 d1 4a 88 bc", ascii: "k)...D ... .J..", direction: "C->S", protocol_phase: "Session ID & Random", highlight_type: "info" },
    { offset: "0020", hex: "00 02 13 01 00 2b 00 03 02 03 04 00 33 00 26 00", ascii: ".....+......3.&.", direction: "C->S", protocol_phase: "Supported Versions: 0x0304", highlight_label: "TLS 1.3 Version Extension", highlight_type: "secure" },
    { offset: "0030", hex: "16 03 03 00 7a 02 00 00 76 03 03 4b 18 a2 e1 90", ascii: "....z...v..K....", direction: "S->C", protocol_phase: "TLS 1.3 ServerHello", is_transition_point: true, highlight_label: "Server selects TLS 1.3 & AES-256-GCM", highlight_type: "secure" },
    { offset: "0040", hex: "17 03 03 01 20 89 a4 e1 9f bb cc 20 d9 18 2b f4", ascii: ".... ...... ..+.", direction: "C->S", protocol_phase: "Encrypted Application Data", highlight_label: "SMTPS Ciphertext Stream", highlight_type: "secure" },
  ],
};

export const CASE_2_INSPECTION: StreamForensicInspection = {
  state_timeline: [
    { step: 1, phase: "TCP_ESTABLISHED", direction: "C->S", summary: "TCP connection established on submission port 587", status: "normal" },
    { step: 2, phase: "SMTP_BANNER", direction: "S->C", summary: "Server Banner: 220 mailgw-01.external.org ESMTP Postfix", status: "normal" },
    { step: 3, phase: "SMTP_EHLO", direction: "C->S", summary: "Client initiates capabilities negotiation via EHLO client.internal.lan", status: "normal" },
    { step: 4, phase: "STARTTLS_STRIP", direction: "S->C", summary: "TAMPERED BANNER: MitM adversary stripped '250-STARTTLS' from response", is_transition_point: true, status: "compromised" },
    { step: 5, phase: "DOWNGRADE_FALLBACK", direction: "C->S", summary: "Client falls back to plaintext submission: AUTH LOGIN sent unencrypted", is_transition_point: true, status: "downgrade" },
    { step: 6, phase: "CREDENTIAL_EXPOSURE", direction: "C->S", summary: "Base64 encoded administrative credentials leaked in cleartext wire bytes", status: "compromised" },
  ],
  raw_chunks: [
    { offset: "0000", hex: "45 48 4c 4f 20 63 6c 69 65 6e 74 2e 69 6e 74 65", ascii: "EHLO client.inte", direction: "C->S", protocol_phase: "SMTP EHLO Query", highlight_type: "info" },
    { offset: "0010", hex: "72 6e 61 6c 2e 6c 61 6e 0d 0a 00 00 00 00 00 00", ascii: "rnal.lan........", direction: "C->S", protocol_phase: "EHLO FQDN", highlight_type: "info" },
    { offset: "0020", hex: "32 35 30 2d 6d 61 69 6c 67 77 2d 30 31 20 48 65", ascii: "250-mailgw-01 He", direction: "S->C", protocol_phase: "SMTP 250 Response", highlight_type: "info" },
    { offset: "0030", hex: "32 35 30 2d 53 49 5a 45 20 33 35 38 38 32 35 37", ascii: "250-SIZE 3588257", direction: "S->C", protocol_phase: "250-SIZE capability", highlight_type: "info" },
    { offset: "0040", hex: "32 35 30 2d 50 49 50 45 4c 49 4e 49 4e 47 0d 0a", ascii: "250-PIPELINING..", direction: "S->C", protocol_phase: "STARTTLS TAMPER POINT", is_transition_point: true, highlight_label: "CRITICAL: 250-STARTTLS stripped by inline MitM!", highlight_type: "danger" },
    { offset: "0050", hex: "32 35 30 20 48 45 4c 50 0d 0a 00 00 00 00 00 00", ascii: "250 HELP........", direction: "S->C", protocol_phase: "End of Capabilities", highlight_type: "info" },
    { offset: "0060", hex: "41 55 54 48 20 4c 4f 47 49 4e 0d 0a 00 00 00 00", ascii: "AUTH LOGIN......", direction: "C->S", protocol_phase: "Plaintext Fallback", is_transition_point: true, highlight_label: "PLAINTEXT AUTH TRANSMISSION", highlight_type: "danger" },
    { offset: "0070", hex: "33 33 34 20 56 58 4e 6c 63 6d 35 68 62 57 55 36", ascii: "334 VXNlcm5hbWU6", direction: "S->C", protocol_phase: "Server Challenge (Username:)", highlight_type: "warning" },
    { offset: "0080", hex: "59 57 52 74 61 57 35 41 5a 32 39 32 4c 6d 6c 75", ascii: "YWRtaW5AZ292Lmlu", direction: "C->S", protocol_phase: "Leaked Credential", is_transition_point: true, highlight_label: "LEAKED: admin@gov.in (base64)", highlight_type: "danger" },
  ],
};

export const CASE_3_INSPECTION: StreamForensicInspection = {
  state_timeline: [
    { step: 1, phase: "TCP_ESTABLISHED", direction: "C->S", summary: "TCP connection established on SMTP port 25", status: "normal" },
    { step: 2, phase: "STARTTLS_OK", direction: "S->C", summary: "STARTTLS command accepted by legacy server", status: "normal" },
    { step: 3, phase: "TLS_RECORD_10", direction: "C->S", summary: "Obsolete TLS 1.0 ClientHello initiated (Record byte 0x16 0x03 0x01)", is_transition_point: true, status: "downgrade" },
    { step: 4, phase: "WEAK_CIPHER_SELECT", direction: "S->C", summary: "Server selects 0x000A (TLS_RSA_WITH_3DES_EDE_CBC_SHA) without PFS", is_transition_point: true, status: "compromised" },
    { step: 5, phase: "EXPIRED_CERT_CHAIN", direction: "S->C", summary: "Server presents expired self-signed certificate with 1024-bit RSA key and SHA-1", status: "compromised" },
  ],
  raw_chunks: [
    { offset: "0000", hex: "16 03 01 00 85 01 00 00 81 03 01 5f 43 9b 12 8a", ascii: "..........._C...", direction: "C->S", protocol_phase: "TLS 1.0 ClientHello", is_transition_point: true, highlight_label: "Obsolete TLS 1.0 (0x16 0x03 0x01)", highlight_type: "danger" },
    { offset: "0010", hex: "00 04 00 0a 00 05 00 00 00 00 00 00 00 00 00 00", ascii: "................", direction: "C->S", protocol_phase: "Cipher List includes 0x000A (3DES)", highlight_label: "Sweet32 vulnerable cipher", highlight_type: "warning" },
    { offset: "0020", hex: "16 03 01 00 4a 02 00 00 46 03 01 5f 43 9b 13 41", ascii: "....J...F.._C..A", direction: "S->C", protocol_phase: "TLS 1.0 ServerHello", is_transition_point: true, highlight_label: "Server confirms TLS 1.0 & 3DES-CBC", highlight_type: "danger" },
    { offset: "0030", hex: "16 03 01 03 20 0b 00 03 1c 00 03 19 30 82 03 15", ascii: ".... .......0...", direction: "S->C", protocol_phase: "X.509 Certificate Record", is_transition_point: true, highlight_label: "1024-bit RSA + SHA-1 Expired Cert", highlight_type: "danger" },
  ],
};

export const CASE_4_IMAPS_INSPECTION: StreamForensicInspection = {
  state_timeline: [
    { step: 1, phase: "TCP_ESTABLISHED", direction: "C->S", summary: "TCP connection established on IMAPS port 993 (SYN -> SYN-ACK -> ACK)", status: "normal" },
    { step: 2, phase: "TLS_RECORD_12", direction: "C->S", summary: "ClientHello TLS 1.2 offering ECDHE cipher suites (Record 0x16 0x03 0x01)", is_transition_point: true, status: "secure" },
    { step: 3, phase: "CIPHER_NEGOTIATION", direction: "S->C", summary: "Server selects 0xC02F (TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256) with PFS", is_transition_point: true, status: "secure" },
    { step: 4, phase: "KEY_EXCHANGE", direction: "S->C", summary: "ServerKeyExchange ECDH Ephemeral parameters (Curve secp256r1 / NIST P-256)", status: "secure" },
    { step: 5, phase: "CERT_CHAIN_VALID", direction: "S->C", summary: "Server certificate validated against DigiCert Global Root G2 (4096-bit RSA)", status: "secure" },
    { step: 6, phase: "APPLICATION_DATA", direction: "C->S", summary: "Encrypted IMAP mailbox synchronization and message retrieval", status: "secure" },
  ],
  raw_chunks: [
    { offset: "0000", hex: "16 03 01 00 b8 01 00 00 b4 03 03 62 10 9a b7 4f", ascii: "...........b...O", direction: "C->S", protocol_phase: "TLS 1.2 ClientHello", is_transition_point: true, highlight_label: "TLS 1.2 Record (0x16 0x03 0x01 ClientHello)", highlight_type: "secure" },
    { offset: "0010", hex: "00 02 c0 2f 00 23 00 00 00 0d 00 14 00 12 04 03", ascii: ".../.#..........", direction: "C->S", protocol_phase: "Cipher 0xC02F & Extensions", highlight_label: "ECDHE-RSA-AES128-GCM-SHA256 Offered", highlight_type: "secure" },
    { offset: "0020", hex: "16 03 03 00 56 02 00 00 52 03 03 62 10 9b 11 20", ascii: "....V...R..b... ", direction: "S->C", protocol_phase: "TLS 1.2 ServerHello", is_transition_point: true, highlight_label: "Server confirms 0xC02F with PFS", highlight_type: "secure" },
    { offset: "0030", hex: "16 03 03 01 e8 0b 00 01 e4 00 01 e1 30 82 01 dd", ascii: "............0...", direction: "S->C", protocol_phase: "X.509 Certificate Chain", highlight_label: "DigiCert 4096-bit RSA Chain", highlight_type: "secure" },
    { offset: "0040", hex: "17 03 03 00 a0 3c 9f 18 20 44 ea 29 11 08 2b f4", ascii: ".....<.. D.)..+.", direction: "C->S", protocol_phase: "Encrypted IMAP Transport", highlight_label: "IMAPS Encrypted Mailbox Traffic", highlight_type: "secure" },
  ],
};
