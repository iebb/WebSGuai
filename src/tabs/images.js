
export const encodeBitmap = a => btoa(String.fromCharCode.apply(null,new Uint8Array(a)))
export const decodeBitmap = a => {
  const anim = new Uint8Array([...atob(a)].map(c=>c.charCodeAt()));
  if (anim.length !== 12 * 6) return false;
  return anim;
}