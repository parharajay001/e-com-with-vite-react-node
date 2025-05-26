import { useState } from 'react';
import {
  Box,
  IconButton,
  Modal,
  Skeleton,
  CircularProgress,
  Typography,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  BrokenImage as BrokenImageIcon,
} from '@mui/icons-material';

export interface ImageCarouselProps {
  images: Array<{
    url: string;
    alt?: string;
  }>;
  thumbnailSize?: {
    width: string | number;
    height: string | number;
  };
  className?: string;
  style?: React.CSSProperties;
  showAll?: boolean;
}

export const ImageCarousel = ({
  images,
  thumbnailSize = { width: '50px', height: '50px' },
  className,
  style,
  showAll = false,
}: ImageCarouselProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [errorStates, setErrorStates] = useState<{ [key: number]: boolean }>({});

  const handleImageLoad = (index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: false }));
    setErrorStates((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: false }));
    setErrorStates((prev) => ({ ...prev, [index]: true }));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
  };

  const handleClose = () => {
    setSelectedImageIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedImageIndex === null) return;

    switch (e.key) {
      case 'ArrowLeft':
        handlePrev(e as unknown as React.MouseEvent);
        break;
      case 'ArrowRight':
        handleNext(e as unknown as React.MouseEvent);
        break;
      case 'Escape':
        handleClose();
        break;
    }
  };

  if (!images?.length) return null;

  const displayImages = showAll ? images : [images[0]];
  const remainingCount = images.length - 1;

  return (
    <>
      <Box
        className={className}
        style={style}
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
        }}
        role="group"
        aria-label="Image carousel"
      >
        {displayImages.map((image, index) => (
          <Badge
            key={`${image.url}-${index}`}
            badgeContent={!showAll && remainingCount > 0 ? `+${remainingCount}` : 0}
            color="primary"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                right: 5,
                top: '75%',
                padding: '0px',
                height: '22px',
                width: '22px',
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: thumbnailSize.width,
                height: thumbnailSize.height,
                '& img': {
                  width: '100%',
                  height: '100%',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  padding: '5px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                },
              }}
            >
              {loadingStates[index] && (
                <Skeleton
                  variant="rectangular"
                  width={thumbnailSize.width}
                  height={thumbnailSize.height}
                  sx={{ position: 'absolute', borderRadius: '10px' }}
                />
              )}
              {errorStates[index] ? (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'action.hover',
                    borderRadius: '10px',
                  }}
                >
                  <BrokenImageIcon />
                </Box>
              ) : (
                <img
                  src={image.url}
                  alt={image.alt || `Image ${index + 1}`}
                  onClick={() => setSelectedImageIndex(index)}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  crossOrigin="anonymous"
                  loading="lazy"
                  aria-label={`Open ${image.alt || `image ${index + 1}`} in full view`}
                />
              )}
            </Box>
          </Badge>
        ))}
      </Box>

      <Modal
        open={selectedImageIndex !== null}
        onClose={handleClose}
        aria-labelledby="image-carousel-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            backgroundColor: 'background.paper',
            borderRadius: 1,
            padding: 1,
            '& img': {
              maxWidth: '100%',
              maxHeight: '85vh',
              objectFit: 'contain',
            },
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-label="Image viewer"
        >          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              zIndex: 2,
            }}
            onClick={handleClose}
            aria-label="Close image viewer"
          >
            <CloseIcon />
          </IconButton>

          {images.length > 1 && (
            <>
              <IconButton
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: 'background.paper',
                  },
                  zIndex: 1,
                }}
                onClick={handlePrev}
                aria-label="Previous image"
              >
                <PrevIcon />
              </IconButton>

              <IconButton
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: 'background.paper',
                  },
                  zIndex: 1,
                }}
                onClick={handleNext}
                aria-label="Next image"
              >
                <NextIcon />
              </IconButton>
            </>
          )}

          {selectedImageIndex !== null && (
            <Box sx={{ position: 'relative' }}>
              {loadingStates[selectedImageIndex] && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px',
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              {errorStates[selectedImageIndex] ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px',
                    gap: 2,
                  }}
                >
                  <BrokenImageIcon fontSize="large" />
                  <Typography>Failed to load image</Typography>
                </Box>
              ) : (
                <img
                  src={images[selectedImageIndex].url}
                  alt={images[selectedImageIndex].alt || `Image ${selectedImageIndex + 1}`}
                  style={{ display: 'block' }}
                  onLoad={() => handleImageLoad(selectedImageIndex)}
                  onError={() => handleImageError(selectedImageIndex)}
                  crossOrigin="anonymous"
                  loading="lazy"
                />
              )}
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};
