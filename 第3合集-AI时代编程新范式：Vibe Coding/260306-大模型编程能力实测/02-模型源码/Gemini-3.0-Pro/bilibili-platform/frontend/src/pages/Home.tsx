import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchVideo } from '../api';
import { PlayCircle, Clock, User } from 'lucide-react';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '热门';
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await searchVideo(keyword);
        // bilibili-api search result structure:
        // res.result is the list of videos usually
        // Let's adapt based on actual response structure
        // Assuming res.result is array of video objects
        if (res && res.result) {
            setVideos(res.result);
        } else if (Array.isArray(res)) {
            setVideos(res);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [keyword]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-bilibili-pink">Results for:</span> {keyword}
      </h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bilibili-pink"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video: any) => (
            <Link to={`/video/${video.bvid}`} key={video.bvid} className="group">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={video.pic.replace('http:', 'https:')} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-bilibili-blue transition-colors" dangerouslySetInnerHTML={{__html: video.title}}>
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{video.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PlayCircle size={12} />
                      <span>{video.play}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
