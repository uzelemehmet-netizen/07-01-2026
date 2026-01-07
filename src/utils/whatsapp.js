export function openWhatsApp(url) {
  if (typeof window === "undefined") return;

  try {
    const newWindow = window.open(url, "_blank");

    // Eğer popup engellenirse veya yeni pencere açılamazsa, aynı sekmede yönlendir
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      window.location.href = url;
    }
  } catch (error) {
    // Her ihtimale karşı fallback
    window.location.href = url;
  }
}
