import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getBoards } from '../../apis/boardApi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import BoardCard from '../../components/board/BoardCard';
import CreateNew from '../../components/board/CreateNew';

const Home = () => {
  const user = useSelector((state) => state.auth.user); // Firebase user
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
        console.log('Fetching boards for user:', user.uid);
        const boards = await getBoards(user.uid); // ✅ use uid from Firebase
        setAllBoards(boards);
      } catch (error) {
        console.error('Error fetching boards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex-col">
      {user ? (
        <div>
          <Navbar allBoards={allBoards} setAllBoards={setAllBoards} />
          <div className='grid grid-cols-8 gap-2 m-3'>
            <CreateNew />
            {allBoards.map((board) => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        </div>
      ) : (
        <div>User not logged in</div>
      )}
    </div>
  );
};

export default Home;
