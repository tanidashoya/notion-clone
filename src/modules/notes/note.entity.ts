import { Database } from "../../../database.types";

//Javascriptの場合一般的なオブジェクトアクセスではドット記法を使いますが、
//Supabaseの型定義では文字列キーを使用しているため、ブラケット記法[""]が必要
//TypeScript では type キーワードを先頭につけると、**「型エイリアス（型の定義）」**を宣言している
export type Note = Database["public"]["Tables"]["notes"]["Row"];