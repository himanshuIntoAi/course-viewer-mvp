import { useEffect, useState } from 'react';
import styles from './FlashCard.module.css';

const MAX_CHARS = 240;

const LikeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
  </svg>
);

interface FlashCardProps {
  id?: number;
  front: string;
  back: string;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  isFullScreen?: boolean;
  onDelete?: () => void;
  isFlipped: boolean;
  onFlip: () => void;
  gradient: string;
  onFullScreen?: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ 
  front, 
  back, 
  isSelected = false, 
  onSelect, 
  isFullScreen = false, 
  onDelete,
  isFlipped,
  onFlip,
  gradient,
  onFullScreen
}) => {
  const isLongText = back.length > MAX_CHARS;
  const [likes, setLikes] = useState<number>(0);
  const [savedLists, setSavedLists] = useState<string[]>([]);
  const [showListPopup, setShowListPopup] = useState<boolean>(false);
  const [customLists] = useState<string[]>(['Favorites', 'Study Later', 'Important', 'Custom List']);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showListPopup && !target.closest(`.${styles.saveButtonContainer}`)) {
        setShowListPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showListPopup]);

  const cardStyle = {
    '--card-gradient': gradient
  } as React.CSSProperties;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFlip) {
      onFlip();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(true);
    }
    if (onFullScreen) {
      onFullScreen();
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes(prev => prev + 1);
    setIsLiked(true);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowListPopup(!showListPopup);
  };

  const handleSave = (e: React.MouseEvent, selectedList: string) => {
    e.stopPropagation();
    
    setSavedLists(prev => {
      if (prev.includes(selectedList)) {
        return prev.filter(list => list !== selectedList);
      }
      return [...prev, selectedList];
    });
    
    setTimeout(() => {
      setShowListPopup(false);
    }, 200);
  };

  const handleLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchQuery = encodeURIComponent(front);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <div 
      className={`${styles.cardContainer} ${isFullScreen ? styles.fullScreen : ''}`}
    >
      <div
        className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
        onClick={handleClick}
        style={cardStyle}
        key={`card-${front.substring(0, 20)}`}
      >
        <div className={styles.front}>
          {!isFullScreen && (
            <>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.stopPropagation();
                  if (onSelect) {
                    onSelect(e.target.checked);
                  }
                }}
                className={styles.checkbox}
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                onClick={handleDelete}
                className={styles.deleteButton}
              >
                ×
              </button>
            </>
          )}
          <div className={styles.content}>{front}</div>
          <div className={styles.frontOverlay} />
          <div className={styles.hoverIconsContainer}>
            <div className={styles.hoverIcons}>
              <button 
                className={styles.iconButton}
                onClick={handleLink}
                title="Search on Google"
              >
                <LinkIcon />
              </button>
              <button 
                className={`${styles.iconButton} ${isLiked ? styles.liked : ''}`}
                onClick={handleLike}
                title={`${likes} likes`}
              >
                <LikeIcon />
              </button>
              <div className={styles.saveButtonContainer}>
                <button
                  className={`${styles.iconButton} ${savedLists.length > 0 ? styles.saved : ''}`}
                  onClick={handleSaveClick}
                  title={`Saved to ${savedLists.length} lists`}
                >
                  <SaveIcon />
                </button>
                {showListPopup && (
                  <div className={styles.listPopup} onClick={e => e.stopPropagation()}>
                    <div className={styles.listPopupHeader}>Save to List</div>
                    {customLists.map((list, index) => {
                      const isSelected = savedLists.includes(list);
                      return (
                        <button
                          key={index}
                          className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
                          onClick={(e) => handleSave(e, list)}
                        >
                          {list}
                          {isSelected && (
                            <span className={styles.savedIndicator}></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.back}>
          <div className={styles.content}>
            {isFullScreen ? back : (
              <>
                {isLongText ? back.slice(0, MAX_CHARS) : back}
                {isLongText && !isFullScreen && (
                  <span>
                    ...
                    <button 
                      className={styles.moreButton}
                      onClick={handleMoreClick}
                    >
                      More
                    </button>
                  </span>
                )}
              </>
            )}
          </div>
          <div className={styles.backOverlay} />
          <div className={styles.hoverIconsContainer}>
            <div className={styles.hoverIcons}>
              <button 
                className={styles.iconButton}
                onClick={handleLink}
                title="Search on Google"
              >
                <LinkIcon />
              </button>
              <button 
                className={`${styles.iconButton} ${isLiked ? styles.liked : ''}`}
                onClick={handleLike}
                title={`${likes} likes`}
              >
                <LikeIcon />
              </button>
              <div className={styles.saveButtonContainer}>
                <button
                  className={`${styles.iconButton} ${savedLists.length > 0 ? styles.saved : ''}`}
                  onClick={handleSaveClick}
                  title={`Saved to ${savedLists.length} lists`}
                >
                  <SaveIcon />
                </button>
                {showListPopup && (
                  <div className={styles.listPopup} onClick={e => e.stopPropagation()}>
                    <div className={styles.listPopupHeader}>Save to List</div>
                    {customLists.map((list, index) => {
                      const isSelected = savedLists.includes(list);
                      return (
                        <button
                          key={index}
                          className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
                          onClick={(e) => handleSave(e, list)}
                        >
                          {list}
                          {isSelected && (
                            <span className={styles.savedIndicator}></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCard; 