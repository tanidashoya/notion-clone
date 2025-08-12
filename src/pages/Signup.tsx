import { useState } from "react";
import { authRepository } from "../modules/auth/auth.repository";
import { useCurrentUserStore } from "@/modules/auth/current-user.state";
import { Navigate } from "react-router-dom";
function Signup() {

  const [name,setName] = useState("");  
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const currentUserStore = useCurrentUserStore();

  //signUp メソッドを呼び出すと、内部で supabase.auth.signUp() が実行されますが、
  //これは Supabase の認証サーバーに新規ユーザー登録を依頼する API なので、
  //結果として Supabase の認証データベースにそのユーザー情報が保存されます。
  //保存先：
  //Supabase プロジェクトの Auth → Users に登録される
  //メールや user_metadata.name は Supabase の管理画面でも確認できる
  //パスワードは ハッシュ化されて保存されるため、復元はできない
  const signup = async() => {
    const user = await authRepository.signUp(name,email,password);
    currentUserStore.set(user);
    console.log(user);
  }

  if (currentUserStore.currentUser != null) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Notionクローン
        </h2>
        <div className="mt-8 w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="username"
                >
                  ユーザー名
                </label>
                <div className="mt-1">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="username"
                    name="username"
                    placeholder="ユーザー名"
                    required
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  メールアドレス
                </label>
                <div className="mt-1">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                    name="email"
                    placeholder="メールアドレス"
                    required
                    type="email"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  パスワード
                </label>
                <div className="mt-1">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    name="password"
                    placeholder="パスワード"
                    required
                    type="password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <button 
                  //バリデーション処理
                  disabled={!name || !email || !password}
                  onClick={signup}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
