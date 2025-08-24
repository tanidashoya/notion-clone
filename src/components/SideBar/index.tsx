/*
SideBar コンポーネント
このコンポーネントは、Notion風ノートアプリのサイドバーとして機能し、
以下の主要機能を提供します：

主な機能：
1. ユーザー情報表示とログアウト機能（UserItemコンポーネントを配置）
2. ノート検索機能へのアクセス（検索ボタンを配置）
3. ノート一覧表示エリアの提供（NoteListコンポーネントを配置）
4. 新規ノート作成機能（ノート作成ボタンと作成処理）とナビゲーション

SideBar自体の責務：
- 各機能コンポーネントのレイアウト配置
- 新規ノート作成の処理
- サイドバー全体のスタイリングとUI構造
*/

import { FC } from 'react';
import { Item } from './Item';
import { NoteList } from '../NoteList';
import UserItem from './UserItem';
import { Plus, Search } from 'lucide-react';
import { useCurrentUserStore } from '../../modules/auth/current-user.state';
import { useNoteStore } from '../../modules/notes/note.state';
import { noteRepository } from '../../modules/notes/note.repository';
import { useNavigate } from 'react-router-dom';

type Props = {
  onSearchButtonClicked: () => void;
};

const SideBar: FC<Props> = ({ onSearchButtonClicked }) => {
  const navigate = useNavigate(); 
  const {currentUser} = useCurrentUserStore();
  const noteStore = useNoteStore();

  const createNote = async() => {
    //titleは仮に渡さなくても大丈夫なようにオプショナルにしてある
    //このボタンではノートが生成されるだけでタイトルはつけないので第二引数にtitleを渡さず、空のオブジェクトにしている
    const newNote = await noteRepository.create(currentUser!.id,{})
    noteStore.set([newNote])
    navigate(`notes/${newNote.id}`)
  }

  return (
    <>
      <aside className="group/sidebar h-full bg-neutral-100 overflow-y-auto relative flex flex-col w-60">
        <div>
          <div>
            <UserItem
              user={{
                id: 'test',
                aud: 'test',
                email: 'test@gmail.com',
                user_metadata: { name: 'testさん' },
                app_metadata: {},
                created_at: 'test',
              }}
              signout={() => {}}
            />
            <Item label="検索" icon={Search} onClick={onSearchButtonClicked} />
          </div>
          <div className="mt-4">
            <NoteList />
            <Item label="ノートを作成" icon={Plus} onClick={createNote} />
          </div>
        </div>
      </aside>
      <div className="absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]"></div>
    </>
  );
};

export default SideBar;
