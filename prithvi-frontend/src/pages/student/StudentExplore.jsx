import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentExplore.css';

const TOPICS = [
  { id: 1, title: "Sutlej River: Punjab's Lifeline Under Threat", category: 'Water Bodies', icon: '💧', color: '#0284c7', bg: 'linear-gradient(135deg,#0284c7,#0e7490)', difficulty: 'Beginner', duration: 15, xp: 80, desc: "Discover the ecological crisis facing Punjab's most vital river and what students can do." },
  { id: 2, title: "The Secret Life of Punjab's Forests", category: 'Forests', icon: '🌳', color: '#15803d', bg: 'linear-gradient(135deg,#15803d,#166534)', difficulty: 'Beginner', duration: 20, xp: 100, desc: "Explore Punjab's dwindling forest cover, its biodiversity, and urgent conservation needs." },
  { id: 3, title: 'Air Quality Crisis: Stubble Burning', category: 'Air Quality', icon: '🌬️', color: '#64748b', bg: 'linear-gradient(135deg,#475569,#334155)', difficulty: 'Intermediate', duration: 18, xp: 90, desc: "Why does Punjab's air turn toxic each October? The science and solutions explained." },
  { id: 4, title: 'Harike Wetland: A Ramsar Paradise', category: 'Wildlife', icon: '🦋', color: '#7c3aed', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', difficulty: 'Beginner', duration: 12, xp: 70, desc: "India's largest wetland at the Beas-Sutlej confluence is home to 400+ bird species." },
  { id: 5, title: 'Solar Energy Revolution in Rural Punjab', category: 'Renewable Energy', icon: '☀️', color: '#f59e0b', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', difficulty: 'Intermediate', duration: 22, xp: 110, desc: "How solar power is transforming farming communities and reducing carbon footprints." },
  { id: 6, title: 'Zero Waste Living: A Student Guide', category: 'Waste Management', icon: '♻️', color: '#0891b2', bg: 'linear-gradient(135deg,#0891b2,#0e7490)', difficulty: 'Beginner', duration: 14, xp: 75, desc: "Practical steps to reduce your waste footprint starting from your school bag." },
  { id: 7, title: 'Underground Water Crisis in Punjab', category: 'Water Conservation', icon: '💦', color: '#1d4ed8', bg: 'linear-gradient(135deg,#1d4ed8,#1e40af)', difficulty: 'Advanced', duration: 25, xp: 130, desc: "68% of Punjab's groundwater blocks are over-exploited. What does this mean for the future?" },
  { id: 8, title: 'Biodiversity Hotspots of Northwest India', category: 'Wildlife', icon: '🐾', color: '#15803d', bg: 'linear-gradient(135deg,#166534,#14532d)', difficulty: 'Intermediate', duration: 20, xp: 100, desc: "From Shivalik leopards to migratory flamingos — the incredible wildlife of our region." },
  { id: 9, title: 'Climate Change: Local Impacts on Punjab', category: 'Climate', icon: '🌡️', color: '#ef4444', bg: 'linear-gradient(135deg,#ef4444,#dc2626)', difficulty: 'Intermediate', duration: 18, xp: 95, desc: "Changing monsoons, heat waves, and crop failures — how climate change hits home." },
];

const CATEGORIES = ['All', 'Forests', 'Water Bodies', 'Air Quality', 'Wildlife', 'Waste Management', 'Renewable Energy', 'Water Conservation', 'Climate'];

const LOCAL_ISSUES = [
  { title: 'Sutlej River Pollution', icon: '🏭', fact: 'Ludhiana discharges 450 ML of untreated effluent daily into the Sutlej.' },
  { title: 'Crop Residue Burning', icon: '🔥', fact: 'Over 15 million tons of paddy straw is burned annually in Punjab.' },
  { title: 'Harike Bird Sanctuary', icon: '🦜', fact: 'Over 400 bird species, including Siberian cranes, visit Harike annually.' },
  { title: 'Kandi Soil Erosion', icon: '⛰️', fact: 'The Shivalik foothills lose topsoil 10x faster than replenishment rate.' },
  { title: 'Groundwater Depletion', icon: '🌊', fact: "Punjab's water table drops 1 meter every year due to paddy cultivation." },
];

export default function StudentExplore() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = TOPICS.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="explore-page">
      {/* Search */}
      <div className="explore-search-wrap">
        <div className="explore-search">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search topics, lessons, tasks..." />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {/* Category chips */}
      <div className="cat-filter scroll-hide">
        {CATEGORIES.map(c => (
          <button key={c} className={`cat-filter-chip ${activeCategory === c ? 'active' : ''}`}
            onClick={() => setActiveCategory(c)}>{c}</button>
        ))}
      </div>

      {/* Featured Hero */}
      {!search && activeCategory === 'All' && (
        <div className="featured-hero">
          <div className="featured-left">
            <span className="featured-chip">🌟 Featured Topic</span>
            <h2>Sutlej River: Punjab's Lifeline Under Threat</h2>
            <p>"The Sutlej flows through 4 countries, but Punjab's stretch is among the most polluted in Asia."</p>
            <button className="s-btn-green" onClick={() => navigate('/student/lessons')}>Explore Topic →</button>
          </div>
          <div className="featured-right">
            <div className="river-scene">
              <div className="river-water">
                <div className="river-wave" />
                <div className="river-wave" style={{ animationDelay: '0.5s', opacity: 0.7 }} />
              </div>
              <div className="factory">🏭</div>
              <div className="fish">🐟</div>
            </div>
          </div>
        </div>
      )}

      {/* Topic Cards */}
      <div className="topics-grid">
        {filtered.map((topic, i) => (
          <div key={topic.id} className="topic-card" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="topic-card-top" style={{ background: topic.bg }}>
              <span className="topic-big-icon">{topic.icon}</span>
              <span className="topic-cat-chip">{topic.category}</span>
            </div>
            <div className="topic-card-body">
              <div className="topic-title">{topic.title}</div>
              <div className="topic-desc">{topic.desc}</div>
            </div>
            <div className="topic-card-footer">
              <span>⏱ {topic.duration}m</span>
              <span>📊 {topic.difficulty}</span>
              <span className="topic-xp">🌟 +{topic.xp} XP</span>
            </div>
            <button className="topic-explore-btn" onClick={() => navigate('/student/lessons')}>
              Explore →
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="no-results">
            <span style={{ fontSize: 48 }}>🔍</span>
            <p>No topics found for "{search}"</p>
          </div>
        )}
      </div>

      {/* Local Issues */}
      {!search && (
        <div className="local-issues-section">
          <h3>🏔️ Punjab's Environmental Story</h3>
          <p>Local issues, global impact</p>
          <div className="local-issues-scroll scroll-hide">
            {LOCAL_ISSUES.map(issue => (
              <div key={issue.title} className="local-issue-card">
                <span className="local-issue-icon">{issue.icon}</span>
                <div className="local-issue-title">{issue.title}</div>
                <div className="local-issue-fact">{issue.fact}</div>
                <button className="s-btn-green-sm" onClick={() => navigate('/student/tasks')}>Take Action</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
