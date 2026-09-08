import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const { openCreateModal } = useTaskContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when typing inside form inputs
      const tag = e.target.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Ignore if modifier keys (Ctrl, Alt, Meta) are held
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      switch (e.key) {
        case 'n':
        case 'N':
          e.preventDefault();
          openCreateModal();
          break;

        case '/': {
          e.preventDefault();
          const searchInput = document.querySelector(
            'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]'
          );
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;
        }

        case 'g':
        case 'G':
          e.preventDefault();
          navigate('/goals');
          break;

        case 'c':
        case 'C':
          e.preventDefault();
          navigate('/calendar');
          break;

        case 'a':
        case 'A':
          e.preventDefault();
          navigate('/analytics');
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, openCreateModal]);
}
