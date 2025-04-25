import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getBoards } from '../../apis/boardApi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import BoardCard from '../../components/home/BoardCard';
import CreateNew from '../../components/home/CreateNew';

const Home = () => {
  const user = useSelector((state) => state.auth.user);
  const [allBoards, setAllBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const boards = await getBoards(user.uid);
        setAllBoards(boards);
      } catch (error) {
        console.error('Error fetching boards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment bg-cover text-yellow-600 font-harry text-3xl">
        Summoning your spellbook...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment bg-cover bg-center text-yellow-100 font-harry bg-gradient-to-b bg-gray-900 bg-blend-overlay">
    {user ? (
        <>
          <Navbar allBoards={allBoards} setAllBoards={setAllBoards} />

          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="text-center mb-14">
              <h1 className="text-6xl text-yellow-300 drop-shadow-[0_0_20px_gold] tracking-widest">
                Welcome to the Wizard’s Task Chamber
              </h1>
              <p className="mt-4 text-lg italic text-yellow-200">
                Where each board holds a powerful spell of productivity 🪄
              </p>
            </div>

            {/* CreateNew Section - Centered */}
            <div className="flex justify-center mb-16">
              <CreateNew />
            </div>

            {/* All Boards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-12">
              {allBoards.map((board) => (
                <BoardCard key={board._id} boardID={board._id} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-screen bg-black/80">
          <p className="text-3xl text-yellow-400 font-harry">
            Muggle detected. Please login! 🧙
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
