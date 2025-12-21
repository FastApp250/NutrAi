
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { analyzeMeal } from '../geminiService';
import { Button } from '../components/UI';
import { Camera, Type, Loader2, Check, AlertCircle, X, Image as ImageIcon, Droplets, Zap, ShieldCheck, ScanBarcode, ZapOff, Trash2, AlertTriangle, Info, Edit3, PlusCircle } from 'lucide-react';
import { DraftMeal } from '../types';
import { Html5Qrcode } from 'html5-qrcode';

export const Input = ({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) => {
  const { user, addLog, draftMeal, setDraftMeal } = useApp();
  
  // Initialize state from draft if available
  const [mode, setModeState] = useState<'initial' | 'camera' | 'barcode' | 'analyzing' | 'result'>(draftMeal?.mode || 'initial');
  const [image, setImageState] = useState<string | null>(draftMeal?.image || null);
  const [text, setTextState] = useState(draftMeal?.text || '');
  const [analysis, setAnalysisState] = useState<any>(draftMeal?.analysis || null);
  const [showHint, setShowHint] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State for "Add Details" mode

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Sync state changes to global draft
  const updateState = (updates: Partial<DraftMeal>) => {
    // Calculate new state values
    const newMode = updates.mode !== undefined ? updates.mode : mode;
    const newImage = updates.image !== undefined ? updates.image : image;
    const newText = updates.text !== undefined ? updates.text : text;
    const newAnalysis = updates.analysis !== undefined ? updates.analysis : analysis;

    // Update local state
    if (updates.mode !== undefined) setModeState(updates.mode);
    if (updates.image !== undefined) setImageState(updates.image);
    if (updates.text !== undefined) setTextState(updates.text);
    if (updates.analysis !== undefined) setAnalysisState(updates.analysis);

    // Update global context
    setDraftMeal({
        mode: newMode,
        image: newImage,
        text: newText,
        analysis: newAnalysis
    });
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
          track.stop();
      });
      streamRef.current = null;
    }
    setFlashOn(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera(); // Ensure camera is stopped if active
      const reader = new FileReader();
      reader.onloadend = () => {
        updateState({ image: reader.result as string, mode: 'initial' });
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        } 
      });
      streamRef.current = stream;
      updateState({ mode: 'camera' });
      setShowHint(true);
      setTimeout(() => setShowHint(false), 4000);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      fileInputRef.current?.click(); 
    }
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        // @ts-ignore - torch support check
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        // @ts-ignore
        if (capabilities.torch) {
            try {
                // @ts-ignore
                await track.applyConstraints({ advanced: [{ torch: !flashOn }] });
                setFlashOn(!flashOn);
            } catch (e) {
                console.error(e);
            }
        }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        updateState({ image: dataUrl, mode: 'initial' });
      }
    }
  };

  // Barcode Logic
  useEffect(() => {
    if (mode === 'barcode') {
        const timer = setTimeout(() => {
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }
            const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
            
            scannerRef.current.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    handleBarcodeDetected(decodedText);
                },
                (errorMessage) => { }
            ).catch(err => {
                console.error("Error starting scanner", err);
                updateState({ mode: 'initial' });
            });
        }, 100);

        return () => clearTimeout(timer);
    } else {
        if (scannerRef.current && scannerRef.current.isScanning) {
             scannerRef.current.stop().then(() => {
                 scannerRef.current?.clear();
             }).catch(console.error);
        }
    }
  }, [mode]);

  useEffect(() => {
      return () => {
          if (scannerRef.current && scannerRef.current.isScanning) {
              scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(console.error);
          }
      };
  }, []);

  const handleBarcodeDetected = async (code: string) => {
      if (scannerRef.current && scannerRef.current.isScanning) {
          await scannerRef.current.stop();
          scannerRef.current.clear();
      }
      
      updateState({ mode: 'analyzing' });

      try {
          const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
          const data = await response.json();
          
          if (data.status === 1) {
              const p = data.product;
              const n = p.nutriments || {};
              
              const analysisResult = {
                  name: p.product_name || "Packaged Food",
                  calories: Math.round(n['energy-kcal_serving'] || n['energy-kcal_100g'] || 0),
                  protein: Math.round(n['proteins_serving'] || n['proteins_100g'] || 0),
                  carbs: Math.round(n['carbohydrates_serving'] || n['carbohydrates_100g'] || 0),
                  fats: Math.round(n['fat_serving'] || n['fat_100g'] || 0),
                  iron: parseFloat((n['iron_serving'] || n['iron_100g'] || 0).toFixed(2)),
                  vitaminA: parseFloat((n['vitamin-a_serving'] || n['vitamin-a_100g'] || 0).toFixed(1)) * 1000000, 
                  zinc: parseFloat((n['zinc_serving'] || n['zinc_100g'] || 0).toFixed(1)),
                  calcium: 0,
                  folate: 0,
                  iodine: 0,
                  suggestions: ["Check the packaging for exact values", "Processed foods may be high in sodium"],
                  alerts: [],
                  missing: [],
                  riskSeverity: 'Low'
              };

              if (analysisResult.fats > 20) analysisResult.alerts.push("High Fat Content");
              if ((n['sugars_100g'] || 0) > 15) analysisResult.alerts.push("High Sugar Content");

              updateState({ analysis: analysisResult, mode: 'result' });
          } else {
              alert("Product not found in database.");
              updateState({ mode: 'initial' });
          }
      } catch (e) {
          console.error(e);
          alert("Error fetching product data.");
          updateState({ mode: 'initial' });
      }
  };


  const handleAnalyze = async () => {
    if (!image && !text) return;
    
    updateState({ mode: 'analyzing' });
    const result = await analyzeMeal(image, text, user);
    updateState({ analysis: result, mode: 'result' });
    setIsEditing(false);
  };

  const handleSave = () => {
    if (analysis) {
      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        name: analysis.name,
        calories: analysis.calories,
        macros: {
          protein: analysis.protein,
          carbs: analysis.carbs,
          fats: analysis.fats
        },
        micros: {
          iron: analysis.iron || 0,
          vitaminA: analysis.vitaminA || 0,
          zinc: analysis.zinc || 0,
          calcium: analysis.calcium || 0,
          folate: analysis.folate || 0,
          iodine: analysis.iodine || 0
        },
        image: image || undefined,
        suggestions: analysis.suggestions,
        alerts: analysis.alerts,
        missing: analysis.missing,
        riskSeverity: analysis.riskSeverity
      });
      setDraftMeal(null);
      onComplete();
    }
  };

  const handleDiscard = () => {
      updateState({ analysis: null, mode: 'initial' });
  };

  const handleClose = () => {
      setDraftMeal(null);
      onBack();
  };

  const handleEditDetails = () => {
      setIsEditing(true);
      // We go back to 'analyzing' state visually but allow editing
      // Actually simpler to just show the text area again
  };

  if (mode === 'camera') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative overflow-hidden bg-black">
             <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
             />
             <canvas ref={canvasRef} className="hidden" />

             {/* Positioning Guide Overlay - Refined Cal AI Style */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-72 h-72 relative opacity-90">
                    {/* Top Left */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg drop-shadow-md"></div>
                    {/* Top Right */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg drop-shadow-md"></div>
                    {/* Bottom Left */}
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg drop-shadow-md"></div>
                    {/* Bottom Right */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg drop-shadow-md"></div>
                 </div>
             </div>

             {/* Fading Hint Text */}
             <div className={`absolute top-24 left-0 right-0 text-center pointer-events-none transition-opacity duration-1000 ${showHint ? 'opacity-100' : 'opacity-0'}`}>
                 <span className="bg-black/50 backdrop-blur-md text-white font-medium px-4 py-2 rounded-full text-sm border border-white/10 shadow-lg">
                     Position your plate in the frame
                 </span>
             </div>

             {/* Controls */}
             <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                {/* Top Controls */}
                <div className="flex justify-between items-start pointer-events-auto mt-4 pt-safe">
                     <button onClick={toggleFlash} className="bg-black/30 backdrop-blur-md p-3 rounded-full text-white border border-white/10 active:scale-95 transition-transform hover:bg-black/40">
                        {flashOn ? <Zap size={24} className="fill-white"/> : <ZapOff size={24} />}
                     </button>
                     <button onClick={() => { stopCamera(); updateState({ mode: 'initial' }); }} className="bg-black/30 backdrop-blur-md p-3 rounded-full text-white border border-white/10 active:scale-95 transition-transform hover:bg-black/40">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Bottom Controls */}
                <div className="flex justify-between pb-8 pointer-events-auto items-center px-4">
                     <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors border border-white/10 active:scale-95 shadow-lg">
                        <ImageIcon size={24} />
                     </button>
                     {/* Hidden input strictly for camera mode to ensure it exists in DOM */}
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                     
                     {/* Shutter Button */}
                     <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-[5px] border-white/30 flex items-center justify-center active:scale-95 transition-transform shadow-xl">
                        <div className="w-[66px] h-[66px] bg-white rounded-full shadow-inner"></div>
                     </button>
                     
                     {/* Spacer to balance layout (aligns shutter to center) */}
                     <div className="w-[58px]"></div>
                </div>
             </div>
        </div>
      </div>
    );
  }

  if (mode === 'barcode') {
      return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex-1 relative bg-black flex items-center justify-center">
                <div id="reader" className="w-full h-full"></div>
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1 rounded-br-xl"></div>
                    </div>
                    <p className="text-white font-medium mt-8 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Scan a food barcode</p>
                </div>
                
                <div className="absolute top-6 right-6 pointer-events-auto z-10">
                    <button onClick={() => updateState({ mode: 'initial' })} className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white">
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
      )
  }

  if (mode === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-center">
        <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
            <div className="bg-green-50 p-4 rounded-full relative z-10">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-6">Processing</h2>
        <p className="text-gray-500 mt-2 font-medium">Fetching nutrition data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <button onClick={handleClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><X className="text-gray-900" /></button>
        <h2 className="text-lg font-bold">{analysis ? 'Review Entry' : 'New Entry'}</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col px-6 overflow-y-auto no-scrollbar">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{analysis ? 'Meal Breakdown' : 'What did you eat?'}</h1>

        {(!analysis || isEditing) && (
            <div className={`transition-all ${isEditing ? 'pb-24' : ''}`}>
                {/* 1. Camera Control Row */}
                <div className="grid grid-cols-2 gap-3 mb-6 flex-shrink-0">
                    <button 
                        onClick={startCamera}
                        className="flex flex-col items-center justify-center gap-2 h-32 rounded-3xl bg-black text-white hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
                    >
                        <Camera size={28} />
                        <span className="font-bold text-sm">Snap Photo</span>
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 h-32 rounded-3xl bg-gray-50 text-gray-900 hover:bg-gray-100 active:scale-[0.98] transition-all border border-gray-100"
                    >
                        <ImageIcon size={28} />
                        <span className="font-bold text-sm">Gallery</span>
                    </button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>

                {/* 2. Captured Image Preview */}
                {image && (
                    <div className="mb-6 relative rounded-3xl overflow-hidden shadow-sm border border-gray-100 aspect-[4/3] group animate-fade-in">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => updateState({ image: null })} className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                                <Trash2 size={16} /> Remove
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. Text Input */}
                <div className="mb-6 relative">
                     <textarea
                        value={text}
                        onChange={(e) => updateState({ text: e.target.value })}
                        placeholder="Add details (e.g. 200g rice and beans)..."
                        className="w-full bg-gray-50 rounded-3xl p-5 min-h-[140px] text-base font-medium resize-none outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                    <div className="absolute top-5 right-5 pointer-events-none text-gray-400">
                        <Type size={20} />
                    </div>
                </div>

                {/* 4. Secondary Actions - Only show when NOT editing an existing analysis */}
                {!isEditing && (
                    <div className="mb-8">
                        <Button variant="outline" onClick={() => updateState({ mode: 'barcode' })} className="w-full border-dashed border-2 py-4 text-gray-500 hover:text-black hover:border-black">
                            <ScanBarcode size={20}/> Scan Barcode
                        </Button>
                    </div>
                )}
                
                {isEditing && (
                    <Button onClick={handleAnalyze}>Re-Analyze</Button>
                )}
            </div>
        )}

        {analysis && !isEditing && (
            <div className="animate-fade-in space-y-6 pb-24">
                
                 {/* High Risk Warning Banner - GOAL 2: Clear warning with actionable advice */}
                {(analysis.riskSeverity === 'High' || analysis.riskSeverity === 'Medium') && (
                    <div className={`p-5 rounded-3xl shadow-lg ${analysis.riskSeverity === 'High' ? 'bg-red-600 text-white shadow-red-200' : 'bg-orange-500 text-white shadow-orange-200'}`}>
                         <div className="flex items-start gap-3">
                             <AlertTriangle className="text-white flex-shrink-0 mt-1" size={24} />
                             <div>
                                 <h4 className="font-bold text-lg leading-tight mb-1">
                                     {analysis.riskSeverity === 'High' ? 'Malnutrition Risk Alert' : 'Dietary Imbalance Detected'}
                                 </h4>
                                 <p className="font-medium opacity-90 text-sm leading-relaxed mb-3">
                                     {analysis.riskSeverity === 'High' 
                                        ? "This meal is significantly deficient in key nutrients required for your goals." 
                                        : "This meal is missing some essential components."}
                                 </p>
                                 <div className="bg-white/20 rounded-xl p-3 text-sm font-medium backdrop-blur-sm">
                                    <strong className="block text-xs uppercase opacity-70 mb-1">Actionable Advice:</strong>
                                    {analysis.missing && analysis.missing.length > 0 ? `Try adding ${analysis.missing[0]} to balance this meal.` : "Add a source of protein or vegetables."}
                                 </div>
                             </div>
                         </div>
                    </div>
                )}

                <div className="flex gap-4 items-start">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                        {image ? (
                            <img src={image} alt={analysis.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                <ImageIcon size={32} />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{analysis.name}</h3>
                        <div className="text-3xl font-extrabold text-gray-900">{analysis.calories} <span className="text-sm font-medium text-gray-400">kcal</span></div>
                    </div>
                </div>

                {/* GOAL 1: Dedicated Section for Macros */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Macronutrients</h4>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { l: 'Protein', v: analysis.protein, c: 'bg-green-50 text-green-700' },
                            { l: 'Carbs', v: analysis.carbs, c: 'bg-blue-50 text-blue-700' },
                            { l: 'Fats', v: analysis.fats, c: 'bg-gray-50 text-gray-700' }
                        ].map(m => (
                            <div key={m.l} className={`text-center py-4 rounded-2xl ${m.c}`}>
                                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">{m.l}</div>
                                <div className="font-extrabold text-xl">{m.v}g</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GOAL 1: Dedicated Section for Micros */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Micronutrients</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-red-50 p-3 rounded-2xl flex flex-col items-center text-center border border-red-100">
                            <div className="bg-white p-1.5 rounded-full mb-2 text-red-500 shadow-sm"><Droplets size={14}/></div>
                            <span className="text-lg font-extrabold text-gray-900 leading-none mb-0.5">{analysis.iron || 0}<span className="text-xs font-semibold text-gray-400">mg</span></span>
                            <span className="text-[10px] font-bold text-red-400 uppercase">Iron</span>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-2xl flex flex-col items-center text-center border border-orange-100">
                            <div className="bg-white p-1.5 rounded-full mb-2 text-orange-500 shadow-sm"><Zap size={14}/></div>
                            <span className="text-lg font-extrabold text-gray-900 leading-none mb-0.5">{analysis.vitaminA || 0}<span className="text-xs font-semibold text-gray-400">mcg</span></span>
                            <span className="text-[10px] font-bold text-orange-400 uppercase">Vit A</span>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-2xl flex flex-col items-center text-center border border-indigo-100">
                            <div className="bg-white p-1.5 rounded-full mb-2 text-indigo-500 shadow-sm"><ShieldCheck size={14}/></div>
                            <span className="text-lg font-extrabold text-gray-900 leading-none mb-0.5">{analysis.zinc || 0}<span className="text-xs font-semibold text-gray-400">mg</span></span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">Zinc</span>
                        </div>
                    </div>
                </div>

                {/* Missing Ingredients / Add Details Section */}
                {analysis.missing && analysis.missing.length > 0 && (
                    <div className="bg-gray-50 border border-gray-100 p-5 rounded-3xl">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Info size={16}/> Missing Items
                        </h4>
                        <ul className="space-y-2 mb-4">
                            {analysis.missing.map((m: string, i: number) => (
                                <li key={i} className="text-sm font-medium text-gray-600 flex gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                    {m}
                                </li>
                            ))}
                        </ul>
                         {/* GOAL 1: Add Details Button */}
                        <Button variant="outline" onClick={handleEditDetails} className="w-full text-xs h-auto py-2 bg-white border-gray-200">
                            <PlusCircle size={14} /> Add Details if AI missed something
                        </Button>
                    </div>
                )}
                
                {/* Suggestions */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Check size={16} className="text-black"/> Suggestions</h4>
                    <div className="space-y-4">
                        {analysis.suggestions.map((s: string, i: number) => (
                            <div key={i} className="text-sm text-gray-600 font-medium flex gap-3 leading-relaxed">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
        
        {!analysis && !isEditing && (
            <div className="flex-1"></div>
        )}
      </div>

       {/* Footer Actions */}
       {!isEditing && (
            <div className="pb-safe p-6 bg-white/90 backdrop-blur-md sticky bottom-0 border-t border-gray-100">
                {analysis ? (
                    <div className="flex gap-3">
                        <Button variant="outline" className="bg-white flex-1" onClick={handleDiscard}>Discard</Button>
                        <Button className="flex-[2]" onClick={handleSave}>Log Meal</Button>
                    </div>
                ) : (
                    <Button onClick={handleAnalyze} disabled={!image && !text.trim()}>
                        Analyze Entry
                    </Button>
                )}
            </div>
       )}
    </div>
  );
};
