import styled from 'styled-components';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  padding-left: ${({ theme }) => theme.spacing['2xl']};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surfaceHover};
    box-shadow: 
      0 0 0 3px ${({ theme }) => theme.colors.accentGlow},
      0 4px 16px ${({ theme }) => theme.colors.accentGlow};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${SearchInput}:focus ~ & {
    color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-50%) scale(1.1);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textMuted};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const SearchBar = ({ onSearch }) => {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <SearchContainer>
      <SearchIcon>
        <Search size={20} />
      </SearchIcon>
      <SearchInput
        type="text"
        id="library-search"
        name="search"
        placeholder="Search books, authors, or groups..."
        value={value}
        onChange={handleChange}
      />
      {value && (
        <ClearButton onClick={handleClear}>
          <X size={20} />
        </ClearButton>
      )}
    </SearchContainer>
  );
};

export default SearchBar;
