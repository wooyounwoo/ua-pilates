"use client";

import { useState } from "react";

export default function KioskPage() {
  const [phoneNum, setPhoneNum] = useState("");
  const [step, setStep] = useState("input"); // 'input' | 'select' | 'done'
  const [userInfo, setUserInfo] = useState({ name: "", classType: "" });
  const [isLoading, setIsLoading] = useState(false);

  // 💡 대표님 URL로 꼭 변경해주세요!
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxDCeEoIOqA4fVkP2v877ikWZO8V9zMdX0fPCp-w5KtQY1q-WEzdGfZmg63HK5oC3Q/exec";

  // 1. 번호 입력 후 [확인] 누를 때 (이건 회원 정보를 불러와야 해서 로딩이 1~2초 걸립니다)
  const handleLogin = async () => {
    if (phoneNum.length < 4) {
      alert("번호 뒷자리 4자리를 정확히 입력해주세요.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "login", phoneNum }),
        redirect: "follow"
      });
      const result = await res.json();
      
      if (result.status === "success") {
        setUserInfo({ name: result.memberName, classType: result.classType });
        setStep("select"); // 클래스 선택 화면으로 이동
      } else {
        alert(result.message); // "등록되지 않은 번호입니다" 등
        setPhoneNum("");
      }
    } catch (e) {
      alert("서버와 통신할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 2. 출석하기 버튼 누를 때 (여기가 낙관적 업데이트 적용 구간!)
  const handleAttend = (selectedClass: string) => {
    // 1️⃣ 구글 서버의 대답을 기다리지 않고, 화면을 0.1초 만에 완료 화면으로 넘겨버립니다.
    setStep("done");

    // 2️⃣ 화면은 넘어갔지만, 백그라운드(뒤)에서는 몰래 구글 시트로 출석 데이터를 쏘고 있습니다. (await 안 씀)
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "attend", phoneNum, classType: selectedClass }),
      redirect: "follow"
    }).catch(e => console.error("출석 백그라운드 전송 에러:", e));

    // 3️⃣ 출석 완료 화면을 3초간 보여준 뒤, 다음 회원을 위해 자동으로 처음 번호 입력 화면으로 돌아갑니다.
    setTimeout(() => {
      setPhoneNum("");
      setStep("input");
    }, 3000);
  };

  // 키패드 숫자 입력 함수
  const handlePadClick = (num: string) => {
    if (phoneNum.length < 8) setPhoneNum(prev => prev + num);
  };
  const handleDelete = () => setPhoneNum(prev => prev.slice(0, -1));

  return (
    <div className="min-h-screen bg-[#F8F1EB] flex flex-col items-center justify-center p-4 font-sans">
      
      <div className="bg-white p-10 rounded-[32px] shadow-2xl w-full max-w-md text-center">
        
        {step === "input" && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-black text-[#4A3E3D] mb-2">UA PILATES</h1>
            <p className="text-gray-500 mb-10 font-medium">휴대폰 번호 뒷자리를 입력해주세요</p>
            
            <div className="text-4xl font-bold tracking-widest text-[#4A3E3D] h-16 flex items-center justify-center bg-gray-50 rounded-2xl mb-8 border border-gray-100">
              {phoneNum || <span className="text-gray-300">____</span>}
            </div>

            {/* 숫자 키패드 */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button key={num} onClick={() => handlePadClick(num.toString())} className="h-16 text-2xl font-bold bg-white border border-gray-200 rounded-2xl hover:bg-[#F8F1EB] hover:border-[#CFA68B] transition-colors shadow-sm">
                  {num}
                </button>
              ))}
              <button onClick={() => setPhoneNum("")} className="h-16 text-lg font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">초기화</button>
              <button onClick={() => handlePadClick("0")} className="h-16 text-2xl font-bold bg-white border border-gray-200 rounded-2xl hover:bg-[#F8F1EB] hover:border-[#CFA68B] transition-colors shadow-sm">0</button>
              <button onClick={handleDelete} className="h-16 text-lg font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">지우기</button>
            </div>

            <button onClick={handleLogin} disabled={isLoading} className="w-full h-16 text-xl font-bold text-white bg-[#4A3E3D] rounded-2xl shadow-lg hover:bg-[#322928] transition-colors disabled:opacity-50">
              {isLoading ? "확인 중..." : "확인"}
            </button>
          </div>
        )}

        {step === "select" && (
          <div className="animate-fade-in py-8">
            <h2 className="text-2xl font-black text-[#4A3E3D] mb-2">{userInfo.name} 회원님</h2>
            <p className="text-gray-500 mb-10">오늘 수강하실 레슨을 선택해주세요.</p>
            
            <div className="space-y-4">
              {userInfo.classType.includes("개인") && (
                <button onClick={() => handleAttend("개인")} className="w-full h-20 text-xl font-bold text-[#4A3E3D] bg-white border-2 border-[#CFA68B] rounded-2xl shadow-sm hover:bg-[#F8F1EB] transition-colors flex items-center justify-center gap-2">
                  🧘‍♀️ 개인 (1:1) 레슨 출석
                </button>
              )}
              {userInfo.classType.includes("그룹") && (
                <button onClick={() => handleAttend("그룹")} className="w-full h-20 text-xl font-bold text-[#4A3E3D] bg-white border-2 border-[#CFA68B] rounded-2xl shadow-sm hover:bg-[#F8F1EB] transition-colors flex items-center justify-center gap-2">
                  👥 그룹 (6:1) 레슨 출석
                </button>
              )}
            </div>
            
            <button onClick={() => { setStep("input"); setPhoneNum(""); }} className="mt-8 text-gray-400 font-medium hover:text-gray-600 underline">
              처음으로 돌아가기
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="animate-fade-in py-16">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">출석 완료!</h2>
            <p className="text-gray-500 text-lg font-medium">오늘도 화이팅입니다 💪</p>
          </div>
        )}

      </div>
      
      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
}