/** Where the screens of subscriptions lead; Detalle and Alerta take the line key. */
export const reviewPath = "/revision";
export const sourcePath = "/fuente";
export const addPath = "/subs/agregar";

export function detailPathOf(lineKey: string): string {
  return `/subs/${encodeURIComponent(lineKey)}`;
}

export function alertPathOf(lineKey: string): string {
  return `/alerta/${encodeURIComponent(lineKey)}`;
}

export function editPathOf(lineKey: string): string {
  return `${detailPathOf(lineKey)}/editar`;
}

export function cancelGuidePathOf(lineKey: string): string {
  return `${detailPathOf(lineKey)}/cancelar`;
}
