export async function fetchSymbolsData(): Promise<string[]> {
  try {
    const response = await fetch(
      "https://fapi.binance.com/fapi/v1/exchangeInfo"
    );

    if (response.ok) {
      const data = await response.json();
      if (!data) {
        return [] as string[];
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const symbols = data.symbols.map((item: any) => {
        return item.symbol;
      });
      // sort symbols
      symbols.sort((a: string, b: string) => a.localeCompare(b));
      return symbols;
    } else {
      console.error(`Failed to fetch data: HTTP ${response.status}`);
      return [] as string[];
    }
  } catch (error) {
    console.error(`Request failed: ${error}`);
    return [] as string[];
  }
}
