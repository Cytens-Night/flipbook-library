import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${props => props.$bgColor || '#FFFFFF'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const CanvasLayer = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const TextLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0.2;
  line-height: 1;
  user-select: text;
  cursor: text;
  
  & > span {
    position: absolute;
    white-space: pre;
    color: transparent;
    cursor: text;
  }
`;

const BookmarkButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  background: rgba(137, 180, 250, 0.9);
  border: none;
  color: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.sm};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(137, 180, 250, 1);
    transform: scale(1.1);
  }
`;

const PDFPageRenderer = ({ 
  pdfData, 
  pageNumber, 
  scale = 1.5,
  isBookmarked,
  onBookmarkToggle,
  onTextSelect,
  bgColor = '#FFFFFF'
}) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const [pdfPage, setPdfPage] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        if (!pdfData) return;
        
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageNumber);
        setPdfPage(page);
      } catch (error) {
        console.error('Error loading PDF page:', error);
      }
    };

    loadPage();
  }, [pdfData, pageNumber]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfPage || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const viewport = pdfPage.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await pdfPage.render(renderContext).promise;

      // Render text layer for selection
      if (textLayerRef.current) {
        const textContent = await pdfPage.getTextContent();
        const textLayerDiv = textLayerRef.current;
        textLayerDiv.innerHTML = '';
        
        textContent.items.forEach((item) => {
          const textSpan = document.createElement('span');
          const tx = pdfjsLib.Util.transform(
            viewport.transform,
            item.transform
          );
          
          textSpan.style.left = tx[4] + 'px';
          textSpan.style.top = tx[5] + 'px';
          textSpan.style.fontSize = Math.abs(tx[0]) + 'px';
          textSpan.style.fontFamily = item.fontName;
          textSpan.textContent = item.str;
          
          textLayerDiv.appendChild(textSpan);
        });
      }
    };

    renderPage();
  }, [pdfPage, scale]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && onTextSelect) {
      onTextSelect(text, pageNumber);
    }
  };

  return (
    <PageContainer $bgColor={bgColor}>
      <CanvasLayer ref={canvasRef} />
      <TextLayer 
        ref={textLayerRef} 
        onMouseUp={handleTextSelection}
      />
      <BookmarkButton 
        onClick={(e) => {
          e.stopPropagation();
          onBookmarkToggle && onBookmarkToggle(pageNumber);
        }}
        title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
      >
        {isBookmarked ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
      </BookmarkButton>
    </PageContainer>
  );
};

export default PDFPageRenderer;
