import { useState, useEffect, useCallback } from "react";
import { Download, ExternalLink, AlertCircle, CheckCircle, XCircle, QrCode, Copy, Check } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import type { BlockchainCredential } from "../../types/index";
import QRCode from "qrcode";
import { BackButton } from "../../components/BackButton";

type CredentialWithHash = BlockchainCredential & { credentialHash: string };

export const UserCredentials = () => {
  const { account, getHolderCredentials, verifyCredential, isActive } = useWeb3();
  const [credentials, setCredentials] = useState<CredentialWithHash[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const loadCredentials = useCallback(async () => {
    if (!isActive || !account) {
      setLoading(false);
      return;
    }
    try {
      const credentialHashes = await getHolderCredentials(account);
      const details = await Promise.all(
        credentialHashes.map(async (hash) => {
          const d = await verifyCredential(hash);
          return { ...d, credentialHash: hash } as CredentialWithHash;
        })
      );
      setCredentials(details);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load credentials");
    } finally {
      setLoading(false);
    }
  }, [account, isActive, getHolderCredentials, verifyCredential]);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  const toggleSelect = (hash: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(hash)) next.delete(hash);
      else next.add(hash);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === credentials.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(credentials.map((c) => c.credentialHash)));
    }
  };

  const createGroupQr = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected).sort();
    const baseUrl = window.location.origin;
    const vcPayload = {
      type: "dhurva-vc",
      hash: ids.join(","),
      verificationUrl: `${baseUrl}/verify?hash=${encodeURIComponent(ids.join(","))}`,
      timestamp: Date.now(),
    };
    const payload = JSON.stringify(vcPayload);
    const uniqueId = ids.join(",");
    setUniqueId(uniqueId);
    setQrPayload(payload);
    try {
      const dataUrl = await QRCode.toDataURL(payload, { width: 256, margin: 2 });
      setQrDataUrl(dataUrl);
    } catch {
      setQrDataUrl("");
    }
  };

  const closeQr = () => {
    setQrPayload(null);
    setQrDataUrl(null);
    setUniqueId(null);
  };

  const copyUniqueId = async () => {
    if (!uniqueId) return;
    await navigator.clipboard.writeText(uniqueId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyIndividualHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getStatusBadge = (cred: BlockchainCredential) => {
    if (!cred.exists) {
      return (
        <div className="bg-red-500/10 text-red-400 text-xs font-semibold px-2 py-1 rounded-lg border border-red-500/30 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Not found
        </div>
      );
    }
    if (cred.revoked) {
      return (
        <div className="bg-red-500/10 text-red-400 text-xs font-semibold px-2 py-1 rounded-lg border border-red-500/30 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Revoked
        </div>
      );
    }
    if (cred.expired) {
      return (
        <div className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-2 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Expired
        </div>
      );
    }
    return (
      <div className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Verified
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="mb-6">
        <BackButton to="/dashboard" />
      </div>
      <h1 className="text-2xl font-bold text-white">Manage your credentials</h1>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-[#5227FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading credentials…</p>
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No credentials found. Connect your wallet to view credentials.</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-4">
            <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
              <input
                type="checkbox"
                checked={selected.size === credentials.length && credentials.length > 0}
                onChange={selectAll}
                className="rounded border-white/30 bg-white/5 text-[#5227FF]"
              />
              <span className="text-sm">Select all</span>
            </label>
            <button
              type="button"
              onClick={createGroupQr}
              disabled={selected.size === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5227FF] text-white text-sm font-medium hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 disabled:cursor-not-allowed border border-[#5227FF]/50 transition-all"
            >
              <QrCode className="w-4 h-4" />
              Create QR for selected ({selected.size})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentials.map((cred, index) => (
              <div
                key={cred.credentialHash}
                className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 overflow-hidden hover:border-white/20 transition-all"
              >
                <div className={`h-1 ${cred.exists && !cred.revoked && !cred.expired ? "bg-[#5227FF]" : "bg-red-500/50"}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(cred)}
                    <label className="flex items-center gap-1 cursor-pointer text-gray-400 text-xs">
                      <input
                        type="checkbox"
                        checked={selected.has(cred.credentialHash)}
                        onChange={() => toggleSelect(cred.credentialHash)}
                        className="rounded border-white/30 bg-white/5 text-[#5227FF]"
                      />
                      Select
                    </label>
                  </div>
                  <div className="text-gray-400 text-sm mb-2">
                    Issued {new Date(Number(cred.issuedAt) * 1000).toLocaleDateString()}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {cred.name || `Credential #${index + 1}`}
                  </h3>
                  {cred.experience && (
                    <p className="text-sm text-gray-400 mb-2 italic">"{cred.experience}"</p>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <p className="flex-1 text-gray-500 text-xs font-mono break-all bg-white/5 p-2 rounded-lg border border-white/10">
                      {cred.credentialHash}
                    </p>
                    <button
                      onClick={() => handleCopyIndividualHash(cred.credentialHash)}
                      className="p-2 text-gray-400 hover:text-[#3DC2EC] bg-white/5 rounded-lg transition-colors shrink-0"
                      title="Copy hash"
                    >
                      {copiedHash === cred.credentialHash ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => (cred as { fileUrl?: string }).fileUrl && window.open((cred as { fileUrl: string }).fileUrl, "_blank")}
                      className="flex-1 flex items-center justify-center py-2 px-4 rounded-xl border border-white/20 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => window.open(`/verify?hash=${cred.credentialHash}`, "_blank")}
                      className="flex-1 flex items-center justify-center py-2 px-4 rounded-xl bg-[#5227FF] text-white text-sm font-medium hover:bg-[#3DC2EC] hover:text-[#0f0a18] border border-[#5227FF]/50 transition-all"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {qrPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/95 backdrop-blur-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Share credentials (QR + Unique ID)</h3>
            <p className="text-sm text-gray-400 mb-4">
              Organization can scan this QR or paste the Unique ID in Verify.
            </p>
            {qrDataUrl && (
              <div className="flex justify-center mb-4">
                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 rounded-xl border border-white/10" />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-1">Unique ID (paste in Verify)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={uniqueId ?? ""}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/20 font-mono text-xs text-white"
                />
                <button
                  type="button"
                  onClick={copyUniqueId}
                  className="px-4 py-2 rounded-xl bg-[#5227FF] text-white flex items-center gap-1 text-sm font-medium hover:bg-[#3DC2EC] hover:text-[#0f0a18] border border-[#5227FF]/50"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={closeQr}
              className="w-full py-2.5 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
