import { atom, useAtom } from "jotai";
import { Note } from "./note.entity";
import { noteRepository } from "./note.repository";

//note.entity.tsで定義したNote型を型定義として使って、Atomを作成
//type Note = {
//     content: string | null;
//     created_at: string;
//     id: number;
//     parent_document: number | null;
//     title: string | null;
//     user_id: string;
// }
//上記のようなNote型でしかこのグローバルステート (noteAtom) には いれられない。
//Note[]:Note型の配列:「この配列に入る要素はすべて Note 型でなければならない」という型ルールを意味
//([]) ⇒ 初期値を空配列にしている
const noteAtom = atom<Note[]>([]);

export const useNoteStore = () => {
    const [notes,setNotes] = useAtom(noteAtom);

    //const a = [note1,note2,note3]
    //const b = [note3,note4,note5]

    //setNotes → jotai の noteAtom を更新するための関数
    // (oldNotes) => { ... } → 関数型アップデート（functional update）
    // jotai（React と同じ仕組み）が、この関数を呼び出す時に、**oldNotes に「今の notes の状態」**を渡してくれます。
    const set = (newNotes:Note[]) => {
        setNotes((oldNotes) => {
            const combinedNotes = [...oldNotes,...newNotes];
            // [note1,note2,note3,note3,note4,note5]

            //Note の id をキーにして重複を排除するための一時オブジェクト
            //このオブジェクトは 数値のキー と Note 型の値 のペアしか持てませんよ」という設計上の約束を型で表している
            //型の形だけを宣言して、空のオブジェクト {} で初期化 しているだけで、中身はまだ何もないオブジェクト。
            //[] を付けるのは「これは固定のプロパティ名じゃなくて、可変なキー名のルールだよ」という記法のルール
            //{[key:number]:Note} は 「キーが数値で、値が Note 型のオブジェクト」という型定義(インデックスシグネチャ)
            //インデックスシグネチャでは キーの型を必ず指定 しないといけない
            const uniqueNotes:{[key:number]:Note} = {};

            //combinedNotes から1件ずつ note を取り出す
            // note.id をキーにして、その値として note 全体を格納
            //オブジェクトでは同じキーを持つ値が追加されたときには既存のキーのものは更新される(重複排除)
            //{ 1: note1, 2: note2, 3: note3(2回目), 4: note4, 5: note5 }となる（１～５は例えばの数字で実際にはDB側で割り当てられる主キー）
            for(const note of combinedNotes){
                uniqueNotes[note.id] = note;
            }

            //Object.values:引数に渡されたオブジェクトの値を配列にするメソッド
            return Object.values(uniqueNotes);
        });
    }


    //(parentId:number):number[])：返り値の型を指定
    //最初のasync(id:number)で渡されているidは削除するノートのid
    //引数で渡される親ノートのIDと子ノートのparent_documentが一致するものを取得して、その子ノートのidを取得する
    //concatメソッド：配列同士を結合して新しい配列を返すメソッド。
    const deleteNote = async(id:number) => {
        //findChildrenIds関数の定義
        const findChildrenIds = (parentId:number):number[] => {
            const childrenIds = notes.filter(note => note.parent_document == parentId).map(child => child.id)
            //再帰的に子ノートのさらに子ノートのidを取得する
            return childrenIds.concat(
                ...childrenIds.map(childId => findChildrenIds(childId))
            );
        }
        //findChildrenIds関数を呼び出して、削除するノートのidの子ノート（全部の子孫ノート）のidを取得する
        const childrenIds = findChildrenIds(id);
        //削除対象のノートは最初の引数で渡されたノートのidとchildrenIdsの配列になる
        //"!deleteIds.includes(note.id)":渡されてきたnoteのidがdeleteIdsの配列に含まれていない場合にtrueを返す
        //trueが返されたものだけを残して、falseが返されたものは削除される
        const deleteIds = [id,...childrenIds];
        setNotes((oldNotes)=>
            oldNotes.filter(note => !deleteIds.includes(note.id))
        )
        await noteRepository.delete(id);
    }

    const getOne = (id:number) => notes.find((note) => note.id == id);
    const clear = () => setNotes([]);

    //getAll という名前の関数を持つオブジェクトを返していて、その関数の戻り値が notes 配列
    //呼び出しもとでは・・・
    // const store = useNoteStore();
    // const notes = store.getAll(); // これでも同じ
    return {
        getAll:() => notes,
        set,
        getOne,
        delete:deleteNote,
        clear,
    }
}