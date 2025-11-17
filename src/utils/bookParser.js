import ePub from 'epubjs';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const CHARS_PER_PAGE = 2000; // Approximate characters per page for text files

/**
 * Parse a book file and extract its content
 * @param {File} file - The book file
 * @param {string} fileHash - The file hash for duplicate detection
 * @returns {Promise<Object>} - Parsed book data
 */
export async function parseBook(file, fileHash) {
  const fileType = file.type;
  const fileName = file.name;
  
  let parsedBook = {
    title: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
    author: 'Unknown Author',
    coverImage: null,
    format: '',
    pages: [],
    totalPages: 0,
    fileHash,
    metadata: {},
  };

  try {
    if (fileType === 'application/pdf') {
      parsedBook = await parsePDF(file, parsedBook);
    } else if (fileType === 'application/epub+zip') {
      parsedBook = await parseEPUB(file, parsedBook);
    } else if (fileType === 'text/plain') {
      parsedBook = await parseTXT(file, parsedBook);
    } else {
      throw new Error('Unsupported file format');
    }
  } catch (error) {
    console.error('Error parsing book:', error);
    throw new Error(`Failed to parse book: ${error.message}`);
  }

  return parsedBook;
}

/**
 * Parse PDF file
 */
async function parsePDF(file, bookData) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const numPages = pdf.numPages;
  const pages = [];
  
  // Extract cover image from first page
  let coverImage = null;
  try {
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await firstPage.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    coverImage = canvas.toDataURL('image/jpeg', 0.7);
  } catch (e) {
    console.error('Failed to extract PDF cover:', e);
  }

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    
    // Also render as canvas for visual representation
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    const imageData = canvas.toDataURL('image/png');
    
    pages.push({
      text,
      image: imageData,
      pageNumber: i,
    });
  }

  return {
    ...bookData,
    format: 'pdf',
    pages,
    totalPages: numPages,
    coverImage: coverImage || bookData.coverImage,
  };
}

/**
 * Parse EPUB file
 */
async function parseEPUB(file, bookData) {
  const arrayBuffer = await file.arrayBuffer();
  const book = ePub(arrayBuffer);
  
  await book.ready;
  
  // Extract metadata
  const metadata = await book.loaded.metadata;
  const cover = await book.coverUrl();
  
  bookData.title = metadata.title || bookData.title;
  bookData.author = metadata.creator || bookData.author;
  bookData.coverImage = cover;
  bookData.metadata = metadata;
  
  // Extract content
  const spine = await book.loaded.spine;
  const pages = [];
  
  for (let i = 0; i < spine.items.length; i++) {
    const item = spine.items[i];
    const doc = await book.load(item.href);
    const text = doc.textContent || '';
    
    // Split long chapters into multiple pages
    const chapterPages = splitTextIntoPages(text);
    pages.push(...chapterPages.map((pageText, index) => ({
      text: pageText,
      pageNumber: pages.length + index + 1,
      chapter: item.href,
    })));
  }

  return {
    ...bookData,
    format: 'epub',
    pages,
    totalPages: pages.length,
  };
}

/**
 * Parse TXT file
 */
async function parseTXT(file, bookData) {
  const text = await file.text();
  const pages = splitTextIntoPages(text);
  
  return {
    ...bookData,
    format: 'txt',
    pages: pages.map((pageText, index) => ({
      text: pageText,
      pageNumber: index + 1,
    })),
    totalPages: pages.length,
  };
}

/**
 * Split text into pages based on character count
 */
function splitTextIntoPages(text, charsPerPage = CHARS_PER_PAGE) {
  const pages = [];
  const paragraphs = text.split(/\n\n+/);
  let currentPage = '';
  
  for (const paragraph of paragraphs) {
    if ((currentPage + paragraph).length > charsPerPage && currentPage.length > 0) {
      pages.push(currentPage.trim());
      currentPage = paragraph;
    } else {
      currentPage += (currentPage ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentPage) {
    pages.push(currentPage.trim());
  }
  
  return pages.length > 0 ? pages : [text];
}
