import React, { useState } from 'react';
import { ThumbsUp, MapPin, Calendar, Cpu, CheckCircle2, Clock, AlertTriangle, Search, Filter, MessageSquare } from 'lucide-react';

export default function CommunityProblems({ problems, onSelectProblem, onUpvote }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const categories = ['All', 'Flooding', 'Road Damage', 'Garbage', 'Streetlights', 'Water'];

  // Filter problems logic
  const filteredProblems = problems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.barangay.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return <span className="badge badge-emerald"><CheckCircle2 size={12} /> Resolved</span>;
      case 'In Progress':
        return <span className="badge badge-azure"><Clock size={12} /> In Progress</span>;
      case 'Pending':
      default:
        return <span className="badge badge-amber"><AlertTriangle size={12} /> AI Queued</span>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'High':
        return <span className="badge badge-rose">High Severity</span>;
      case 'Medium':
        return <span className="badge badge-amber">Medium Severity</span>;
      default:
        return <span className="badge badge-emerald">Low Severity</span>;
    }
  };

  return (
    <section id="problems" className="section community-problems-section">
      <div className="container">
        
        {/* Header */}
        <div className="section-header">
          <div className="badge badge-emerald">Live Community Stream</div>
          <h2 className="section-title">Barangay Reported Issues & Hazards</h2>
          <p className="section-subtitle">
            Browse live civic reports tagged by residents and analyzed by AI computer vision. Upvote urgent hazards to elevate priority.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="filter-container glass-card">
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-right-tools">
            {/* Search Input */}
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search barangay or street..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="select-box">
              <Filter size={14} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="problems-grid">
          {filteredProblems.map((prob) => (
            <div key={prob.id} className="glass-card problem-card glass-card-hoverable">
              
              {/* Card Image Banner */}
              <div className="card-image-wrapper">
                <img src={prob.image} alt={prob.title} className="card-img" />
                <div className="card-img-overlay">
                  <div className="overlay-top flex-between">
                    {getStatusBadge(prob.status)}
                    {getSeverityBadge(prob.severity)}
                  </div>
                  <div className="overlay-bottom">
                    <span className="badge badge-purple ai-score-badge">
                      <Cpu size={12} /> {prob.aiConfidence}% AI Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Main Body */}
              <div className="problem-card-body">
                <div className="problem-id-tag flex-between">
                  <span>{prob.id}</span>
                  <span className="problem-date">
                    <Calendar size={12} /> {new Date(prob.dateReported).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="problem-card-title">{prob.title}</h3>

                <div className="problem-location">
                  <MapPin size={14} className="text-emerald flex-shrink-0" />
                  <span><strong>{prob.barangay}</strong> • {prob.locationName}</span>
                </div>

                <p className="problem-desc">{prob.description}</p>

                {/* AI Tags */}
                <div className="ai-tag-list">
                  {prob.aiTags.map((tag, idx) => (
                    <span key={idx} className="ai-tag">#{tag}</span>
                  ))}
                </div>

                {/* Official Department Status Note */}
                {prob.officialNotes && (
                  <div className="official-note-box">
                    <div className="note-header flex-center">
                      <MessageSquare size={13} className="text-azure" />
                      <span>{prob.assignedDept}</span>
                    </div>
                    <p className="note-text">"{prob.officialNotes}"</p>
                  </div>
                )}
              </div>

              {/* Card Footer: Upvotes & Map Focus */}
              <div className="problem-card-footer flex-between">
                <button
                  onClick={() => onUpvote(prob.id)}
                  className="upvote-btn"
                  title="Upvote to bump urgency"
                >
                  <ThumbsUp size={16} />
                  <span>{prob.upvotes} Upvotes</span>
                </button>

                <button 
                  onClick={() => onSelectProblem(prob)} 
                  className="btn-link-action flex-center"
                >
                  <MapPin size={14} /> View on Map
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="glass-card empty-state text-center">
            <AlertTriangle size={36} className="text-amber margin-auto" />
            <h3>No reports found for this filter</h3>
            <p>Try switching categories or clearing search keywords.</p>
          </div>
        )}

      </div>

      <style>{`
        .community-problems-section {
          background: radial-gradient(circle at 100% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 40%);
        }

        .filter-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1.2rem;
        }

        .category-pills {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .category-pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .category-pill:hover {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .category-pill.active {
          background: linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .filter-right-tools {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .search-box input {
          background: rgba(11, 17, 32, 0.8);
          border: 1px solid var(--border-glass-bright);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          padding: 0.5rem 0.85rem 0.5rem 2.2rem;
          font-size: 0.88rem;
          outline: none;
          width: 220px;
        }

        .search-box input:focus {
          border-color: var(--accent-emerald);
        }

        .select-box {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(11, 17, 32, 0.8);
          border: 1px solid var(--border-glass-bright);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          color: var(--text-muted);
        }

        .select-box select {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 0.88rem;
          outline: none;
          cursor: pointer;
        }

        .problems-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.8rem;
        }

        .problem-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: var(--radius-md);
        }

        .card-image-wrapper {
          position: relative;
          height: 190px;
          overflow: hidden;
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .problem-card:hover .card-img {
          transform: scale(1.06);
        }

        .card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(15, 23, 42, 0.6) 0%, transparent 40%, rgba(15, 23, 42, 0.9) 100%);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .problem-card-body {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .problem-id-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-emerald);
          margin-bottom: 0.5rem;
        }

        .problem-date {
          color: var(--text-muted);
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .problem-card-title {
          font-size: 1.12rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .problem-location {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 0.85rem;
        }

        .problem-desc {
          font-size: 0.86rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .ai-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-bottom: 1rem;
        }

        .ai-tag {
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.05);
          color: var(--accent-azure);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .official-note-box {
          background: rgba(11, 17, 32, 0.6);
          border-left: 3px solid var(--accent-azure);
          padding: 0.65rem 0.85rem;
          border-radius: 0 6px 6px 0;
          margin-top: auto;
        }

        .note-header {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-main);
          gap: 0.35rem;
          margin-bottom: 0.2rem;
        }

        .note-text {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .problem-card-footer {
          padding: 0.85rem 1.25rem;
          background: rgba(11, 17, 32, 0.8);
          border-top: 1px solid var(--border-glass);
        }

        .upvote-btn {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--accent-emerald);
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .upvote-btn:hover {
          background: var(--accent-emerald);
          color: #fff;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        .btn-link-action {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .btn-link-action:hover {
          color: var(--accent-azure);
        }

        .empty-state {
          padding: 4rem 2rem;
          margin-top: 2rem;
        }

        @media (max-width: 1024px) {
          .problems-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .problems-grid { grid-template-columns: 1fr; }
          .filter-container { flex-direction: column; align-items: stretch; }
          .filter-right-tools { flex-direction: column; }
          .search-box input { width: 100%; }
        }
      `}</style>
    </section>
  );
}
