import styled from 'styled-components';
import { Book } from 'lucide-react';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.surface} 0%, ${({ theme }) => theme.colors.surfaceActive || theme.colors.surfaceHover} 100%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
  backdrop-filter: blur(10px);
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, transparent, ${({ theme }) => theme.colors.accentHover});
    opacity: 0.4;
    pointer-events: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  position: relative;
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-2px);
  }
  
  &:active { transform: translateY(0); }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 4px;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  background: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  position: relative;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceHover};
    transform: translateY(-2px);
  }
  
  &.active {
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Header = ({ currentView, onNavigateToShelf }) => {
  return (
    <HeaderContainer>
      <Logo onClick={onNavigateToShelf}>
        <Book size={32} />
        <span>Flipbook Library</span>
      </Logo>
    </HeaderContainer>
  );
};

export default Header;
