import { useEffect, useRef, VideoHTMLAttributes } from 'react';

export function VideoPlayer(props: VideoHTMLAttributes<HTMLVideoElement>) {
  const cloudinaryRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    if (cloudinaryRef.current) return;
      cloudinaryRef.current = window.cloudinary;
      cloudinaryRef.current.videoPlayer(videoRef.current, {
        cloud_name: 'dqrk3drua'
      })
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      data-cld-public-id="samples/cld-sample-video"
      {...props}
    />
  );
}