/**
 * Dictionary API integration for word definitions
 * Uses the Free Dictionary API: https://dictionaryapi.dev/
 */

const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * Fetch definition for a word
 * @param {string} word - The word to look up
 * @returns {Promise<Object>} - Dictionary entry with definitions
 */
export async function lookupWord(word) {
  if (!word || typeof word !== 'string') {
    throw new Error('Invalid word');
  }

  const cleanWord = word.trim().toLowerCase();
  
  try {
    const response = await fetch(`${DICTIONARY_API_URL}/${cleanWord}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Word not found');
      }
      throw new Error('Dictionary API error');
    }

    const data = await response.json();
    
    // Transform API response to simplified format
    return formatDictionaryEntry(data[0]);
  } catch (error) {
    console.error('Dictionary lookup error:', error);
    throw error;
  }
}

/**
 * Format dictionary entry from API response
 * @param {Object} entry - Raw API entry
 * @returns {Object} - Formatted entry
 */
function formatDictionaryEntry(entry) {
  return {
    word: entry.word,
    phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
    audio: entry.phonetics?.find(p => p.audio)?.audio || null,
    origin: entry.origin || '',
    meanings: entry.meanings.map(meaning => ({
      partOfSpeech: meaning.partOfSpeech,
      definitions: meaning.definitions.slice(0, 3).map(def => ({
        definition: def.definition,
        example: def.example || null,
        synonyms: def.synonyms?.slice(0, 5) || [],
        antonyms: def.antonyms?.slice(0, 5) || [],
      })),
    })),
  };
}

/**
 * Example usage:
 * 
 * const definition = await lookupWord('library');
 * console.log(definition);
 * // {
 * //   word: 'library',
 * //   phonetic: '/ˈlaɪˌbrɛɹi/',
 * //   meanings: [
 * //     {
 * //       partOfSpeech: 'noun',
 * //       definitions: [
 * //         {
 * //           definition: 'An institution which holds books...',
 * //           example: 'I went to the library to borrow a book.',
 * //           synonyms: ['bibliotheca'],
 * //         }
 * //       ]
 * //     }
 * //   ]
 * // }
 */
