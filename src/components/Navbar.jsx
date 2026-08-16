export default function Navbar({ searchQuery, setSearchQuery, activeTab, setActiveTab }) {
  const navLinks = [
    { name: 'Gallery', id: 'gallery' },
    { name: 'Studio', id: 'studio' },
    { name: 'Performers', id: 'performers' },
    { name: 'Tags', id: 'tags' }
  ];

  const handleLogoClick = () => {
    setActiveTab('home');
    window.location.reload();
  };

  const handleResetApiKey = () => {
    if (window.confirm("Would you like to change or reset your Stash API Key?")) {
      localStorage.removeItem('stash_api_key');
      window.location.reload();
    }
  };

  return (
    <nav className="bg-[#23252b] h-[60px] w-full px-8 md:px-60 grid grid-cols-[auto_1fr] items-center gap-6 border-b border-[#141519] relative z-50">
      
      <div className="flex items-center gap-10 md:gap-12">
        <div 
          onClick={handleLogoClick}
          className="text-[#f47521] font-extrabold text-2xl tracking-tight lowercase cursor-pointer"
        >
          stash
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <span 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-sm font-semibold cursor-pointer transition-colors ${
                activeTab === item.id ? 'text-[#f47521]' : 'text-gray-300 hover:text-white'
              }`}
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end w-full gap-3">
        <div className="relative w-full max-w-[280px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'home' ? 'video' : activeTab}...`}
            className="w-full bg-[#141519] border border-neutral-700 text-white text-sm rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:border-[#f47521] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <button 
          onClick={handleResetApiKey}
          className="bg-[#141519] border border-neutral-700 hover:border-[#f47521] text-gray-300 hover:text-[#f47521] p-2 rounded-full transition-all shadow-md flex items-center justify-center shrink-0"
          title="API Key Settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 11-7.743-5.743L11 12H9v2H7v2H4v3h3v-2h2v-2h2.257l2.743-2.743A6 6 0 0121 9z" />
          </svg>
        </button>
      </div>
      
    </nav>
  );
}