'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{id: string, title: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'sepia'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('docapprove-theme') as 'dark' | 'sepia' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'sepia' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('docapprove-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.slice(0, 5));
    } catch (error) {
      console.error('Search failed:', error);
    }
    setIsSearching(false);
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        DocApprove
      </Link>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search documents... (AI-powered)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {isSearching && <span className={styles.spinner} />}
      </form>

      <div className={styles.userArea}>
        <button 
          onClick={toggleTheme} 
          className={styles.themeToggle}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <div className={styles.avatar}>A</div>
      </div>
    </header>
  );
}
