import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMapPin, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import styles from './SearchForm.module.scss';

interface SearchFormProps {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  onLocationSearch,
  isLoading,
  error,
  onClearError,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
      onClearError();
      toast.success(`Searching for weather in ${inputValue.trim()}`);
    } else {
      toast.error('Please enter a city name');
    }
  };

  const handleLocationClick = () => {
    onLocationSearch();
    onClearError();
  };

  const handleClearInput = () => {
    setInputValue('');
    onClearError();
  };

  return (
    <motion.div 
      className={styles.searchContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.form 
        onSubmit={handleSubmit} 
        className={styles.searchForm}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div 
          className={`${styles.inputGroup} ${isFocused ? styles.focused : ''}`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.inputWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter city name..."
              className={styles.searchInput}
              disabled={isLoading}
              aria-label="City name input"
              aria-describedby="search-help"
            />
            <AnimatePresence>
              {inputValue && (
                <motion.button
                  type="button"
                  onClick={handleClearInput}
                  className={styles.clearButton}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Clear input"
                >
                  <FiX />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            type="submit"
            className={styles.searchButton}
            disabled={isLoading || !inputValue.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Search for weather"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  className={styles.spinner}
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.span
                  key="search"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiSearch />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
        
        <motion.p 
          id="search-help" 
          className={styles.helpText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Enter a city name to get current weather information
        </motion.p>
        
        <motion.p 
          className={styles.locationHelp}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          💡 Location access requires HTTPS or localhost. If location doesn&apos;t work, try searching for a city instead.
        </motion.p>
      </motion.form>

      <motion.div 
        className={styles.divider}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <span>or</span>
      </motion.div>

      <motion.button
        onClick={handleLocationClick}
        className={styles.locationButton}
        disabled={isLoading}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        aria-label="Get weather for current location"
      >
        <motion.span 
          className={styles.locationIcon}
          animate={{ 
            rotate: isLoading ? 360 : 0,
            scale: isLoading ? 1.1 : 1 
          }}
          transition={{ 
            rotate: { duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" },
            scale: { duration: 0.3 }
          }}
        >
          <FiMapPin />
        </motion.span>
        <span>Use Current Location</span>
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div 
            className={styles.errorMessage} 
            role="alert"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.span 
              className={styles.errorIcon}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ⚠️
            </motion.span>
            <span>{error}</span>
            <motion.button
              onClick={onClearError}
              className={styles.errorClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Dismiss error"
            >
              <FiX />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchForm;
