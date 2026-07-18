import { useState, useEffect, useRef } from 'react';

export function useDanmaku(videoRef, danmakuList, options = {}) {
  const [enabled, setEnabled] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(25);
  const [speed, setSpeed] = useState(5);
  const danmakuContainerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const danmakuElementsRef = useRef([]);

  useEffect(() => {
    if (!enabled || !videoRef.current || !danmakuContainerRef.current) return;

    const container = danmakuContainerRef.current;
    const video = videoRef.current;
    const rows = [];
    const rowHeights = [];
    const numCols = Math.ceil(container.offsetWidth / 100);

    function initRows() {
      const numRows = Math.floor(container.offsetHeight / (fontSize + 5));
      for (let i = 0; i < numRows; i++) {
        rows.push([]);
        rowHeights.push(i * (fontSize + 5));
      }
    }

    function findAvailableRow(width, startTime) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let available = true;
        
        for (const item of row) {
          if (
            startTime < item.endTime &&
            startTime + width / speed > item.startTime
          ) {
            available = false;
            break;
          }
        }
        
        if (available) return i;
      }
      return 0;
    }

    function createDanmakuElement(item) {
      const el = document.createElement('div');
      el.className = 'danmaku-item absolute whitespace-nowrap text-white font-bold pointer-events-none';
      el.textContent = item.content;
      el.style.fontSize = `${fontSize}px`;
      el.style.opacity = opacity;
      el.style.color = `rgb(${decodeColor(item.color || 16777215)})`;
      
      const textWidth = item.content.length * fontSize * 0.8;
      const row = findAvailableRow(textWidth, item.startTime);
      
      el.style.top = `${rowHeights[row]}px`;
      el.style.left = `${container.offsetWidth}px`;
      
      container.appendChild(el);
      
      const duration = (container.offsetWidth + textWidth) / speed;
      el.style.transition = `left ${duration}s linear`;
      
      requestAnimationFrame(() => {
        el.style.left = `-${textWidth}px`;
      });

      const removeTime = item.startTime * 1000 + duration * 1000;
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, removeTime);

      return {
        startTime: item.startTime,
        endTime: item.startTime + duration
      };
    }

    function handleTimeUpdate() {
      const currentTime = video.currentTime;
      
      if (item.time && Math.abs(item.time - currentTime) < 0.5) {
        createDanmakuElement(item);
      }
    }

    initRows();
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [enabled, opacity, fontSize, speed, danmakuList]);

  function toggle() {
    setEnabled(!enabled);
  }

  return {
    containerRef: danmakuContainerRef,
    enabled,
    toggle,
    opacity,
    setOpacity,
    fontSize,
    setFontSize,
    speed,
    setSpeed
  };
}

function decodeColor(color) {
  const num = parseInt(color);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r},${g},${b}`;
}
