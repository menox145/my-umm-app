export function normalizeRole(role?: string | null) {
  if (!role) return "PEGAWAI";

  if (role === "KARYAWAN" || role === "PEGAWAI") return "PEGAWAI";
  if (role === "MANAGER" || role === "PENGAWAS") return "PENGAWAS";

  return role;
}
