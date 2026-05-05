"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [data, setData] = useState({ members: [], todayLogs: [], stats: { personalCount: 0, groupCount: 0, todayCount: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", type: "개인", personal: 0, group: 0, expiry: "", memo: "" });

  // 💡 대표님 URL로 꼭 변경해주세요!
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxDCeEoIOqA4fVkP2v877ikWZO8V9zMdX0fPCp-w5KtQY1q-WEzdGfZmg63HK5oC3Q/exec";

  // 1. 대시보드 데이터 불러오기 (CORS 우회 적용)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL, { 
        method: "POST", 
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "getAdminData" }),
        redirect: "follow"
      });
      const result = await res.json();
      if (result.status === "success") setData(result);
    } catch (e) {
      console.error(e);
      alert("데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. 회원 저장(추가/수정) 로직 (CORS 우회 적용)
  const handleSave = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL, { 
        method: "POST", 
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "saveMember", payload: formData }),
        redirect: "follow"
      });
      const result = await res.json();
      alert(result.message);
      setIsPanelOpen(false);
      fetchData(); // 저장 성공 시 자동 새로고침
    } catch (e) {
      console.error(e);
      alert("저장 과정에서 통신 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // CRM 알림을 위한 계산 로직
  const riskMembers = data.members.filter((m: any) => {
    if (!m.lastAttend) return false;
    return (new Date().getTime() - new Date(m.lastAttend).getTime()) / (1000 * 60 * 60 * 24) >= 14;
  });
  const lowCountMembers = data.members.filter((m: any) => (m.type.includes('개인') && m.personal > 0 && m.personal <= 3) || (m.type.includes('그룹') && m.group > 0 && m.group <= 3));

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans">
      {/* 🔹 왼쪽 사이드바 메뉴 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b"><span className="text-xl font-bold tracking-tighter">UA PILATES</span></div>
        <nav className="p-4 space-y-2 flex-1">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "dashboard" ? "bg-[#4A3E3D] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}>📊 대시보드</button>
          <button onClick={() => setActiveTab("members")} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "members" ? "bg-[#4A3E3D] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}>👥 회원 관리</button>
          <button onClick={() => setActiveTab("stats")} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "stats" ? "bg-[#4A3E3D] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}>💰 마감 / 정산</button>
        </nav>
      </aside>

      {/* 🔹 오른쪽 메인 콘텐츠 영역 */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {activeTab === "dashboard" && "매장 운영 대시보드"}
            {activeTab === "members" && "회원 관리"}
            {activeTab === "stats" && "마감 및 정산 통계"}
          </h1>
          <div className="flex gap-3">
            <button onClick={fetchData} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 font-medium">↻ 새로고침</button>
            {activeTab === "members" && (
              <button onClick={() => { setFormData({ name: "", phone: "", type: "개인", personal: 0, group: 0, expiry: "", memo: "" }); setIsPanelOpen(true); }} className="bg-[#4A3E3D] text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-[#322928] transition-colors">+ 신규 회원 추가</button>
            )}
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-[#CFA68B] border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            
            {/* 탭 1. 대시보드 */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 방문 요약 + CRM (왼쪽 영역) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#4A3E3D] text-white p-8 rounded-[24px] shadow-lg flex flex-col justify-center">
                    <h3 className="text-gray-300 font-bold mb-2 text-sm uppercase tracking-widest">Today's Traffic</h3>
                    <p className="text-6xl font-black mb-2">{data.stats.todayCount}<span className="text-2xl font-normal ml-2 text-gray-400">명 방문</span></p>
                    <p className="text-sm text-gray-400">오늘 키오스크를 통해 출석한 총 인원입니다.</p>
                  </div>

                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200">
                    <h3 className="font-bold mb-6 text-lg flex items-center">🚨 Today's Action Required <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">{riskMembers.length + lowCountMembers.length}건</span></h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-red-50 border border-red-100 rounded-xl">
                        <div><p className="font-bold text-red-700">장기 미출석 (이탈 위험)</p><p className="text-xs text-red-500 mt-1">14일 이상 방문하지 않은 회원</p></div>
                        <span className="text-2xl font-black text-red-700">{riskMembers.length}명</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-orange-50 border border-orange-100 rounded-xl">
                        <div><p className="font-bold text-orange-700">수강권 만료 임박</p><p className="text-xs text-orange-500 mt-1">잔여 횟수 3회 이하 회원</p></div>
                        <span className="text-2xl font-black text-orange-700">{lowCountMembers.length}명</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 실시간 출석 타임라인 (오른쪽 영역) */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-200 flex flex-col h-[500px]">
                  <h3 className="font-bold mb-6 text-lg flex items-center justify-between">
                    ⏱️ 실시간 출석 라인
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{data.todayLogs?.length || 0}건</span>
                  </h3>
                  <div className="overflow-y-auto pr-2 flex-1 space-y-4">
                    {!data.todayLogs || data.todayLogs.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center mt-20">아직 출석 기록이 없습니다.</p>
                    ) : (
                      data.todayLogs.map((log: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start relative">
                          {idx !== data.todayLogs.length - 1 && <div className="absolute top-6 left-2 w-0.5 h-full bg-gray-100"></div>}
                          <div className="w-4 h-4 mt-1.5 bg-[#CFA68B] rounded-full border-2 border-white shadow-sm relative z-10"></div>
                          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-gray-900">{log.name}</span>
                              <span className="text-xs text-gray-500 font-medium">{log.time}</span>
                            </div>
                            <span className="text-xs font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600 shadow-sm">{log.classType} 레슨</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 탭 2. 회원 관리 */}
            {activeTab === "members" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr><th className="p-4 text-xs font-bold text-gray-500 uppercase">회원 정보</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">수강권 / 잔여 횟수</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">만료일 / 최근 출석</th><th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">관리</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.members.map((m: any) => (
                      <tr key={m.phone} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4"><p className="font-bold text-gray-900">{m.name}</p><p className="text-xs text-gray-500">{m.phone}</p></td>
                        <td className="p-4 text-sm"><span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs mr-2 mb-1">{m.type}</span><br/>개인 <span className="font-bold text-[#CFA68B]">{m.personal}</span> / 그룹 <span className="font-bold text-[#CFA68B]">{m.group}</span></td>
                        <td className="p-4 text-sm text-gray-600">
                          <p className="font-semibold text-gray-800">{m.expiry ? new Date(m.expiry).toLocaleDateString() : '만료일 없음'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">최근 출석: {m.lastAttend ? new Date(m.lastAttend).toLocaleDateString() : '-'}</p>
                        </td>
                        <td className="p-4 text-center"><button onClick={() => { setFormData(m); setIsPanelOpen(true); }} className="text-sm font-semibold text-[#4A3E3D] bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">상세/수정</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 탭 3. 마감 및 정산 */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200">
                  <h3 className="text-gray-500 font-bold mb-6 text-sm uppercase tracking-widest">이번 달 예상 강사료 정산액</h3>
                  <div className="flex items-baseline gap-4"><p className="text-5xl font-black text-[#4A3E3D]">₩{(data.stats.personalCount * 70000 + data.stats.groupCount * 25000).toLocaleString()}</p><p className="text-sm text-gray-500 font-medium">* 개인 7만, 그룹 2.5만 단가 임의 적용 기준</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200 flex flex-col justify-center items-center"><p className="text-gray-500 font-bold mb-2">개인 (1:1) 수업 완료</p><p className="text-4xl font-bold text-[#CFA68B]">{data.stats.personalCount}<span className="text-lg text-gray-400 ml-1">건</span></p></div>
                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200 flex flex-col justify-center items-center"><p className="text-gray-500 font-bold mb-2">그룹 (6:1) 수업 완료</p><p className="text-4xl font-bold text-[#CFA68B]">{data.stats.groupCount}<span className="text-lg text-gray-400 ml-1">건</span></p></div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 🔹 사이드 슬라이드 팝업창 (입력칸 명확화 & 만료일 추가 적용) */}
      {isPanelOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsPanelOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-[450px] bg-gray-50 z-[70] shadow-2xl p-10 transform transition-transform animate-slide-in overflow-y-auto border-l border-gray-200">
            <h2 className="text-2xl font-black mb-8 text-[#4A3E3D]">회원 상세 정보</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div><label className="text-xs font-bold text-gray-500 block mb-2">이름 (NAME)</label><input className="w-full bg-white border border-gray-300 rounded-xl p-4 shadow-sm focus:border-[#CFA68B] focus:ring-2 focus:ring-[#CFA68B]/20 outline-none transition-all text-gray-900 font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required/></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-2">전화번호 뒷자리 (PHONE)</label><input className="w-full bg-white border border-gray-300 rounded-xl p-4 shadow-sm focus:border-[#CFA68B] focus:ring-2 focus:ring-[#CFA68B]/20 outline-none transition-all text-gray-900 font-medium" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required/></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-2">수강권 종류</label><select className="w-full bg-white border border-gray-300 rounded-xl p-4 shadow-sm focus:border-[#CFA68B] focus:ring-2 focus:ring-[#CFA68B]/20 outline-none transition-all text-gray-900 font-medium" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="개인">개인</option><option value="그룹">그룹</option><option value="둘다">둘다</option></select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 block mb-2">개인 잔여횟수</label><input type="number" className="w-full bg-white border border-gray-300 rounded-xl p-4 shadow-sm focus:border-[#CFA68B] focus:ring-2 focus:ring-[#CFA68B]/20 outline-none transition-all text-gray-900 font-medium" value={formData.personal} onChange={e => setFormData({...formData, personal: Number(e.target.value)})}/></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-2">그룹 잔여횟수</label><input type="number" className="w-full bg-white border border-gray-300 rounded-xl p-4 shadow-sm focus:border-[#CFA68B] focus:ring-2 focus:ring-[#CFA68B]/20 outline-none transition-all text-gray-900 font-medium" value={formData.group} onChange={e => setFormData({...formData, group: Number(e.target.value)})}/></div>
              </div>
              
              {/* 추가된 수강권 만료일 칸 */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-2">수강권 만료일 (EXPIRY DATE)</label>
                <input type="date" className="w-full bg-white border border-gray-300 rounded-xl p-4 shadow-sm focus:border-[#CFA68B] focus:ring-2 focus:ring-[#CFA68B]/20 outline-none transition-all text-gray-900 font-medium" 
                  value={formData.expiry ? formData.expiry.split('T')[0] : ''} 
                  onChange={e => setFormData({...formData, expiry: e.target.value})}/>
              </div>

              <div><label className="text-xs font-bold text-gray-500 block mb-2">관리자 메모 (NOTE / MEMO)</label><textarea rows={3} className="w-full bg-white border border-gray-300 rounded-xl p-4 shadow-sm focus:border-[#CFA68B] focus:ring-2 focus:ring-[#CFA68B]/20 outline-none transition-all text-gray-900 font-medium resize-none" value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} placeholder="특이사항 입력 (예: 허리 디스크 주의)"></textarea></div>
              <div className="pt-6 flex gap-3">
                <button type="submit" className="flex-1 bg-[#4A3E3D] text-white py-4 rounded-xl font-bold shadow-md hover:bg-[#322928] transition-colors">저장하기</button>
                <button type="button" onClick={() => setIsPanelOpen(false)} className="px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors">취소</button>
              </div>
            </form>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
}