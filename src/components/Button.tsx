import React from 'react';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={`btn btn--${variant} ${fullWidth ? 'btn--full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
