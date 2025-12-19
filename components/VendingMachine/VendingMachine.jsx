"use client";
import { useVendingMachine } from "./useVendingMachine";
import VendingMachineDisplay from "./VendingMachineDisplay";
import VendingMachineControls from "./VendingMachineControls";
import ReceiptPrinter from "./ReceiptPrinter";
import { Icons } from "./Icons";

export default function VendingMachine() {
  const { state, actions } = useVendingMachine();

  return (
    <>
      {/* RECEIPT MODAL - Render di luar vending machine */}
      <ReceiptPrinter 
        track={state.receiptTrack} 
        isPrinting={state.isPrinting}
        onClose={actions.closeReceipt}
      />

      <div className="w-full max-w-sm md:max-w-md mx-auto relative select-none px-4 py-4 md:py-8 mb-20"> 
        
        {/* Coin Animation Overlay */}
        {state.coinAnimation && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-coin-drop pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-yellow-700 shadow-xl flex items-center justify-center text-yellow-900">
               <Icons.Coin className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* === VENDING MACHINE BODY === */}
        <div className={`relative transition-transform duration-75 ${state.machineShake ? 'animate-shake' : ''}`}>
          
          <div className="relative bg-linear-to-b from-[#D4B896] via-retro-bg to-[#C4A57B] border-4 border-retro-text rounded-2xl p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] md:shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] z-10">
            
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-retro-dark/50"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-retro-dark/50"></div>
            
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 bg-gray-800 px-3 py-1.5 rounded-t-xl border-3 border-retro-text">
              <div className="w-12 h-2.5 bg-black rounded-sm border border-gray-600"></div>
            </div>

            <VendingMachineDisplay state={state} actions={actions} />

            <VendingMachineControls 
               loading={state.loading}
               status={state.status}
               usedTrackIds={state.usedTrackIds}
               isPremium={state.isPremium}
               onInsertCoin={actions.insertCoin}
            />

            {/* TRAY PICKUP */}
            <div className="relative z-0"> 
              <div className="mx-auto w-4/5 h-4 md:h-6 bg-gray-900 rounded-b-xl border-3 border-retro-text border-t-0 shadow-inner flex items-end justify-center pb-1 relative z-20">
                <div className="text-[6px] text-gray-600 font-mono font-bold">PICKUP</div>
              </div>
            </div>

          </div>
        </div>

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes coin-drop {
            0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
          @keyframes item-drop {
            0% { transform: translateY(-100px); opacity: 0; }
            50% { transform: translateY(10px); opacity: 1; }
            100% { transform: translateY(0); }
          }
          .animate-coin-drop { animation: coin-drop 0.8s ease-in forwards; }
          .animate-shake { animation: shake 0.1s infinite; }
          .animate-item-drop { animation: item-drop 0.8s ease-out forwards; }
        `}</style>
      </div>
    </>
  );
}