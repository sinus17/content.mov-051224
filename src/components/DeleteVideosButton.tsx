import { useState } from 'react';
import { Trash2, Loader } from 'lucide-react';
import { hot50VideosAdmin } from '../services/hot50-videos/admin';

export function DeleteVideosButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await hot50VideosAdmin.deleteAllVideos();
    } catch (error) {
      console.error('Failed to delete videos:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isDeleting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Confirm Delete</span>
            </>
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-4 py-2 bg-surface text-text-primary rounded-lg hover:bg-surface/80 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-surface text-red-500 rounded-lg hover:bg-surface/80 transition-colors flex items-center space-x-2"
    >
      <Trash2 className="w-4 h-4" />
      <span>Delete All Videos</span>
    </button>
  );
}