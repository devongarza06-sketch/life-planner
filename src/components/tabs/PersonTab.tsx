"use client";
import PersonSection from "./person/PersonSection";

export default function PersonTab(){
  const sections = [
    { id:'physical', label:'Physical' },
    { id:'cognitive', label:'Cognitive' },
    { id:'emotional', label:'Emotional' },
    { id:'social', label:'Social' },
    { id:'meaning', label:'Meaning' }
  ];
  return (
    <div className="space-y-3">
      {sections.map(sec => (<PersonSection key={sec.id} section={sec}/>))}
    </div>
  );
}
