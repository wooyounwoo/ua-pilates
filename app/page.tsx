"use client";

import { useState } from "react";

export default function KioskPage() {
  const [inputNum, setInputNum] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [memberName, setMemberName] = useState(""); 
  const [memberClassType, setMemberClassType] = useState(""); // 💡 수강권 종류 저장

  // 💡 대표님의 웹 앱 URL로 꼭 변경해주세요!
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxDCeEoIOqA4fVkP2v877ikWZO8V9zMdX0fPCp-w5KtQY1q-WEzdGfZmg63HK5oC3Q/exec"; 

  const handleLogin = async (phoneNum: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "login", phoneNum }),
      });
      const result = await res.json();
      
      if (result.status === "success") {
        setMemberName(result.memberName); 
        setMemberClassType(result.classType || ""); // 💡 수강권 종류 받아오기
        setStep(2); 
      } else {
        alert(result.message);
        setInputNum(""); 
      }
    } catch (error) {
      alert("서버 통신에 실패했습니다.");
      setInputNum("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (inputNum.length < 4) {
      const newVal = inputNum + num;
      setInputNum(newVal);
      if (newVal.length === 4) {
        handleLogin(newVal);
      }
    }
  };

  const handleDelete = () => setInputNum(inputNum.slice(0, -1));
  const handleReset = () => { setInputNum(""); setStep(1); setMemberName(""); setMemberClassType(""); };

  const submitAttendance = async (classType: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "attend", phoneNum: inputNum, classType }),
      });
      const result = await res.json();
      
      if (result.status === "success") {
        alert(result.message);
      } else {
        alert("오류: " + result.message);
      }
    } catch (error) {
      alert("서버 통신에 실패했습니다.");
    } finally {
      setIsLoading(false);
      handleReset();
    }
  };

  // 💡 버튼 노출 로직 (시트에 적힌 글자 기준)
  const showPersonal = memberClassType.includes("개인") || memberClassType.includes("VIP") || memberClassType.includes("둘다");
  const showGroup = memberClassType.includes("그룹") || memberClassType.includes("VIP") || memberClassType.includes("둘다");

  return (
    <div className="min-h-screen bg-[#F8F1EB] flex items-center justify-center font-sans text-[#4A3E3D]">
      <div className="w-[400px] h-[650px] bg-white rounded-[30px] shadow-xl p-8 flex flex-col relative">
        
        {step === 1 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-2">우아한 필라테스</h1>
            <p className="text-[#A0938E] mb-10">휴대폰 뒷자리 4자리를 입력해주세요</p>
            
            <div className={`text-4xl tracking-[0.5em] mb-12 font-bold h-12 ${inputNum ? 'text-[#4A3E3D]' : 'text-[#C8B1A6]'}`}>
              {inputNum.padEnd(4, '_').split('').join(' ')}
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button key={num} onClick={() => handleKeyPress(num.toString())} disabled={isLoading}
                  className="w-[75px] h-[75px] mx-auto rounded-full bg-[#FDFBFA] border border-[#EBE4E0] text-2xl hover:bg-[#EBE4E0] transition-colors disabled:opacity-50">
                  {num}
                </button>
              ))}
              <button onClick={handleDelete} disabled={isLoading} className="text-base text-[#A0938E] hover:text-[#4A3E3D]">지우기</button>
              <button onClick={() => handleKeyPress("0")} disabled={isLoading}
                className="w-[75px] h-[75px] mx-auto rounded-full bg-[#FDFBFA] border border-[#EBE4E0] text-2xl hover:bg-[#EBE4E0] transition-colors disabled:opacity-50">
                0
              </button>
              <div></div>
            </div>
            {isLoading && <p className="text-sm text-center mt-4 text-[#A0938E]">정보를 확인 중입니다...</p>}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-2 text-[#4A3E3D]"><span className="text-[#CFA68B]">'{memberName}'</span> 회원님 환영합니다!</h2>
            <p className="text-[#A0938E] mb-8">오늘 수강하실 수업을 선택해주세요.</p>
            
            {/* 💡 조건부 렌더링 로직 적용 */}
            {showPersonal && (
              <button 
                onClick={() => submitAttendance("개인")} disabled={isLoading}
                className="w-full py-5 mb-4 bg-[#D9C5B2] text-white rounded-2xl text-lg font-bold hover:bg-[#CFA68B] shadow-md disabled:opacity-50 transition-colors">
                🧍 개인 1:1 레슨
              </button>
            )}

            {showGroup && (
              <button 
                onClick={() => submitAttendance("그룹")} disabled={isLoading}
                className="w-full py-5 mb-8 bg-[#D9C5B2] text-white rounded-2xl text-lg font-bold hover:bg-[#CFA68B] shadow-md disabled:opacity-50 transition-colors">
                👯‍♀️ 그룹 6:1 레슨
              </button>
            )}

            <button onClick={handleReset} className="text-[#A0938E] underline">처음으로 돌아가기</button>
          </div>
        )}
      </div>
    </div>
  );
}