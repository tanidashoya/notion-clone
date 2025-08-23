import { Note } from '@/modules/notes/note.entity';
import TextAreaAutoSize from 'react-textarea-autosize';
import { useState } from 'react';

interface TitleInputProps {
  initialData: Note;
  onTitleChange: (val: string) => void;
}

export function TitleInput({ initialData, onTitleChange }: TitleInputProps) {
  // ？？:initialDataがnullまたはundefinedの場合 → rightValueを返す
  const [value,setValue] = useState(initialData.title ?? '');
  
  const handleInputChange = (value:string) => {
    setValue(value);
    onTitleChange(value);
  }

  return (
    <div className="pl-[54px] group relative">
      <TextAreaAutoSize
        className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F 
        resize-none"
        value={value}
        //onChange:inputの値が変更されたらpropsで渡されたhandleInputChange関数が実行される
        onChange={(e) => handleInputChange(e.target.value)}
      />
    </div>
  );
}
