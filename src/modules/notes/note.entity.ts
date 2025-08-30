// database.types.tsからDatabase型をインポートしている
//参照元に複数のexportがありdefault exportがない場合に、{}で囲む
import { Database } from "../../../database.types";

//Javascriptの場合一般的なオブジェクトアクセスではドット記法を使いますが、
//TypeScriptの型抽出ではブラケット記法[""]を使う
//TypeScript では type キーワードを先頭につけると、**「型エイリアス（型の定義）」**を宣言している
export type Note = Database["public"]["Tables"]["notes"]["Row"];