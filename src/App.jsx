import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { RefreshCw, Plus, TrendingUp, TrendingDown } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('market');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  
  // Portfolio
  const [portfolio, setPortfolio] = useState(JSON.parse(localStorage.getItem('portfolio')) || []);
  
  // Notícias
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('bitcoin');
  const [newsLoading, setNewsLoading] = useState(false);

  // Conversor
  const [fromCoin, setFromCoin] = useState('bitcoin');
  const [toCoin, setToCoin] = useState('ethereum');
  const [amount, setAmount] = useState(1);
  const [conversionResult, setConversionResult] = useState(null);

  useEffect(() => {
    fetchCoins();
  }, []);

  async function fetchCoins() {
    try {
      const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1');
      setCoins(data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }

  async function fetchCoinHistory(id) {
    try {
      const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`);
      const prices = data.prices.map(([ts, price]) => ({
        x: new Date(ts).toLocaleDateString('pt-BR'),
        y: price
      }));
      setChartData(prices);
      setSelectedCoin(coins.find(c => c.id === id));
    } catch (e) {}
  }

  const fetchNews = async (query = 'bitcoin') => {
    setNewsLoading(true);
    try {
      const API_KEY = "b89a2ffbf9c44e518a78f7d6803daf77";
      const res = await axios.get('https://newsapi.org/v2/everything', {
        params: { q: query + " crypto OR cryptocurrency", language: 'pt', sortBy: 'publishedAt', pageSize: 6, apiKey: API_KEY }
      });
      
      const formatted = res.data.articles.map(a => ({
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source.name,
        date: new Date(a.publishedAt).toLocaleString('pt-BR'),
        image: a.urlToImage
      }));
      setNews(formatted);
    } catch (e) {
      setNews([{ title: "Não foi possível carregar notícias no momento", description: "", url: "#", source: "Sistema", date: "" }]);
    } finally {
      setNewsLoading(false);
    }
  };

  // Conversor
  const convert = () => {
    const from = coins.find(c => c.id === fromCoin);
    const to = coins.find(c => c.id === toCoin);
    if (from && to) {
      const result = (amount * from.current_price) / to.current_price;
      setConversionResult({
        amount: result.toFixed(6),
        from: from.symbol.toUpperCase(),
        to: to.symbol.toUpperCase(),
        value: (amount * from.current_price).toFixed(2)
      });
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-3xl">Carregando CryptoPulse...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Navbar */}
      <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">₿</span>
            <h1 className="text-3xl font-bold">CryptoPulse</h1>
          </div>
          <div className="flex gap-8 text-lg font-medium">
            <button onClick={() => setActiveTab('market')} className={activeTab === 'market' ? 'text-yellow-400' : 'hover:text-yellow-400'}>Mercado</button>
            <button onClick={() => setActiveTab('converter')} className={activeTab === 'converter' ? 'text-yellow-400' : 'hover:text-yellow-400'}>Conversor</button>
            <button onClick={() => setActiveTab('portfolio')} className={activeTab === 'portfolio' ? 'text-yellow-400' : 'hover:text-yellow-400'}>Portfolio</button>
            <button onClick={() => { setActiveTab('news'); fetchNews(searchTerm); }} className={activeTab === 'news' ? 'text-yellow-400' : 'hover:text-yellow-400'}>Notícias</button>
          </div>
          <button onClick={fetchCoins} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 rounded-2xl hover:bg-zinc-700">
            <RefreshCw size={18} /> Atualizar
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* ==================== MERCADO ==================== */}
        {activeTab === 'market' && (
          <div>
            <h2 className="text-5xl font-bold mb-10">Mercado em Tempo Real</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coins.map(coin => (
                <div key={coin.id} onClick={() => fetchCoinHistory(coin.id)} className="bg-zinc-900 p-6 rounded-3xl cursor-pointer hover:scale-[1.03] transition-all">
                  <div className="flex items-center gap-4">
                    <img src={coin.image} alt={coin.name} className="w-12 h-12" />
                    <div className="flex-1">
                      <div className="font-bold text-xl">{coin.symbol.toUpperCase()}</div>
                      <div className="text-zinc-400 text-sm">{coin.name}</div>
                    </div>
                    <div className={`text-right ${coin.price_change_percentage_24h > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {coin.price_change_percentage_24h?.toFixed(1)}%
                    </div>
                  </div>
                  <div className="mt-6 text-3xl font-mono"> ${coin.current_price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CONVERSOR ==================== */}
        {activeTab === 'converter' && (
          <div className="max-w-xl mx-auto bg-zinc-900 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-center mb-10">Conversor de Criptomoedas</h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-zinc-400 mb-2">De</label>
                <select value={fromCoin} onChange={e => setFromCoin(e.target.value)} className="w-full bg-zinc-800 p-5 rounded-2xl text-lg">
                  {coins.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>)}
                </select>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full mt-4 bg-zinc-800 p-5 rounded-2xl text-2xl" />
              </div>

              <div className="text-center text-4xl">↓</div>

              <div>
                <label className="block text-zinc-400 mb-2">Para</label>
                <select value={toCoin} onChange={e => setToCoin(e.target.value)} className="w-full bg-zinc-800 p-5 rounded-2xl text-lg">
                  {coins.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>)}
                </select>
              </div>

              <button onClick={convert} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 text-xl rounded-2xl">
                Converter
              </button>

              {conversionResult && (
                <div className="bg-zinc-800 p-8 rounded-3xl text-center text-3xl font-mono mt-6">
                  {amount} {conversionResult.from} = <span className="text-yellow-400">{conversionResult.amount}</span> {conversionResult.to}
                  <div className="text-sm text-zinc-400 mt-3">Valor aproximado: ${conversionResult.value}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio, Notícias e Modal de Gráfico permanecem iguais (posso enviar se precisar) */}

      </div>
    </div>
  );
}

export default App;
