import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bili-card-bg border-t border-bili-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-bili-text mb-4">关于</h4>
            <ul className="space-y-2 text-sm text-bili-text-gray">
              <li><Link to="/about" className="hover:text-bili-pink">关于我们</Link></li>
              <li><Link to="/contact" className="hover:text-bili-pink">联系我们</Link></li>
              <li><Link to="/join" className="hover:text-bili-pink">加入我们</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-bili-text mb-4">帮助</h4>
            <ul className="space-y-2 text-sm text-bili-text-gray">
              <li><Link to="/help" className="hover:text-bili-pink">使用帮助</Link></li>
              <li><Link to="/feedback" className="hover:text-bili-pink">意见反馈</Link></li>
              <li><Link to="/report" className="hover:text-bili-pink">举报中心</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-bili-text mb-4">社区</h4>
            <ul className="space-y-2 text-sm text-bili-text-gray">
              <li><Link to="/rules" className="hover:text-bili-pink">社区规范</Link></li>
              <li><Link to="/conduct" className="hover:text-bili-pink">行为准则</Link></li>
              <li><Link to="/copyright" className="hover:text-bili-pink">版权政策</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-bili-text mb-4">友情链接</h4>
            <ul className="space-y-2 text-sm text-bili-text-gray">
              <li><a href="https://www.bilibili.com" target="_blank" rel="noopener noreferrer" className="hover:text-bili-pink">Bilibili官网</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-bili-pink">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-bili-border text-center text-sm text-bili-text-gray">
          <p>© 2024 Bilibili Clone. 本项目仅供学习和研究使用。</p>
          <p className="mt-1">Powered by bilibili-api</p>
        </div>
      </div>
    </footer>
  );
};