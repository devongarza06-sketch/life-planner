"use client";

export default function MiscTab(){
  const families = [
    "Finance & Money Ops","Home & Environment","Errands & Procurement","Digital Hygiene","Legal & Identity","Healthcare Admin","Work/School Admin","Transportation & Travel","Security & Risk","Life Ops & Organization","Pets & Dependents","Events & Seasonal Prep","Relationships & Civic Admin"
  ];
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow">
        <h3 className="font-semibold mb-2">Systems & Projects Areas</h3>
        <details className="rounded-xl border">
          <summary className="px-3 py-2 cursor-pointer">Show Areas</summary>
          <div className="p-3 grid md:grid-cols-2 gap-2">
            {families.map((name)=> (<div key={name} className="text-sm text-gray-600 dark:text-gray-300">{name}</div>))}
          </div>
        </details>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow">
          <h4 className="font-semibold mb-1">Maintenance Systems</h4>
          <ul className="list-disc ml-4 text-sm space-y-1">
            <li>2×45-min weekly maintenance blocks</li>
            <li>Monthly Admin Day (finance, digital, subscriptions)</li>
            <li>Quick-hit rule: tasks ≤10 min inside blocks</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow">
          <h4 className="font-semibold mb-1">Mini-Project Card</h4>
          <div className="text-sm space-y-2">
            <input className="w-full border rounded p-2" placeholder="Outcome (clear done + date)"/>
            <textarea className="w-full border rounded p-2" placeholder="Steps"/>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><div className="mb-1">Risk</div><input className="w-full border rounded p-1" defaultValue={4}/></div>
              <div><div className="mb-1">Obligation</div><input className="w-full border rounded p-1" defaultValue={5}/></div>
              <div><div className="mb-1">Batchability</div><input className="w-full border rounded p-1" defaultValue={3}/></div>
            </div>
            <div className="text-xs text-gray-500">Schedule 2×45-min blocks • attach proof when done</div>
            <button className="w-full bg-accent text-white rounded px-3 py-2">Schedule</button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow">
          <h4 className="font-semibold mb-1">Monthly Admin Day</h4>
          <ul className="list-disc ml-4 text-sm space-y-1">
            <li>Finance sweep: bills, budget, transfers</li>
            <li>Digital sweep: inbox, files, backups</li>
            <li>Subscriptions audit</li>
            <li>Surface & schedule mini-projects</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
