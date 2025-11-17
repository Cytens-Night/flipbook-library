import styled, { keyframes } from 'styled-components';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(400px) scale(0.8); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0) scale(1); 
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 420px;
  
  @media (max-width: 768px) {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-width: none;
  }
`;

const ToastItem = styled.div`
  min-width: 280px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  animation: ${slideIn} 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid ${({ $type }) => 
    $type === 'success' ? '#4CAF50' : 
    $type === 'error' ? '#EF5350' : 
    '#89B4FA'};
  backdrop-filter: blur(10px);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateX(-4px) scale(1.02);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15);
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $type }) => 
    $type === 'success' ? 'rgba(76, 175, 80, 0.15)' : 
    $type === 'error' ? 'rgba(239, 83, 80, 0.15)' : 
    'rgba(137, 180, 250, 0.15)'};
  color: ${({ $type }) => 
    $type === 'success' ? '#4CAF50' : 
    $type === 'error' ? '#EF5350' : 
    '#89B4FA'};
  flex-shrink: 0;
`;

const Message = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  
  &:hover {
    background: ${({ theme }) => theme.colors.cardHover};
    color: ${({ theme }) => theme.colors.text};
    transform: rotate(90deg);
  }
`;

const Toast = ({ toasts, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} />;
      case 'error': return <XCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} $type={toast.type}>
          <IconWrapper $type={toast.type}>
            {getIcon(toast.type)}
          </IconWrapper>
          <Message>{toast.message}</Message>
          <CloseButton onClick={() => onClose(toast.id)}>
            <X size={16} />
          </CloseButton>
        </ToastItem>
      ))}
    </ToastContainer>
  );
};

export default Toast;