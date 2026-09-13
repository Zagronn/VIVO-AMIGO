import React, { useState, useEffect } from 'react';
import { Shield, Activity, Globe, Zap, Menu } from 'lucide-react';

interface ConnectionMetric {
  country: string;
  count: string;
}

interface MapNode {
  id: string;
  top: string;
  left: string;
  country: string;
  ip: string;
  connections: string;
  status: string;
}

export const WorldMapDashboard: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionMetric[]>([
    { country: 'GUATEMALA', count: '3,501' },
    { country: 'USA', count: '12,987' },
    { country: 'GERMANY', count: '6,101' },
    { country: 'CHINA', count: '24,555' },
    { country: 'SPAIN', count: '12,977' },
    { country: 'BRAZIL', count: '3,355' },
  ]);

  const [threatScan, setThreatScan] = useState<string>('98.4%');
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);

  const mapNodes: MapNode[] = [
    { id: '1', top: '28%', left: '32%', country: 'USA', ip: '192.168.1.45', connections: '12,987', status: 'SECURE' },
    { id: '2', top: '45%', left: '55%', country: 'GERMANY', ip: '10.0.4.12', connections: '6,101', status: 'ENCRYPTED' },
    { id: '3', top: '60%', left: '78%', country: 'CHINA', ip: '172.16.8.9', connections: '24,555', status: 'MONITORED' },
    { id: '4', top: '72%', left: '26%', country: 'GUATEMALA', ip: '192.168.40.11', connections: '3,501', status: 'SECURE' },
  ];

  useEffect(() => {
    const ws = new WebSocket('wss://api.cargovivo.com/socket');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CONNECTIONS_UPDATE') {
          setConnections(data.connections);
        }
        if (data.type === 'THREAT_SCAN_UPDATE') {
          setThreatScan(data.scanRate);
        }
      } catch (err) {
        console.error('Failed to parse incoming WebSocket message:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-orange-500 font-mono p-4 md:p-6 flex flex-col justify-between select-none">
      <header className="flex justify-between items-center border-b border-orange-500/30 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border border-orange-500 flex items-center justify-center bg-orange-500/10">
            <Shield className="w-5 h-5 text-orange-500 animate-pulse" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-widest text-orange-400">
            VIVO AMIGO // SUPER ADMIN
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline text-xs tracking-wider text-orange-500/70">SECURE FEED ACTIVE</span>
          <Menu className="w-6 h-6 text-orange-500 cursor-pointer hover:text-orange-400" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-grow my-2">
        <div className="bg-[#121216]/80 border border-orange-500/30 p-4 flex flex-col justify-between backdrop-blur-sm">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-orange-400 mb-3 border-b border-orange-500/20 pb-1 flex items-center justify-between">
              <span>Live Global Connections</span>
              <Globe className="w-3.5 h-3.5" />
            </h2>
            <div className="space-y-2 text-xs">
              {connections.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-orange-500/10 pb-1">
                  <span className="text-orange-300">{item.country}</span>
                  <span className="font-bold text-orange-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-orange-500/20">
            <h3 className="text-xs uppercase tracking-widest text-orange-400 mb-2 flex items-center justify-between">
              <span>Active AI Agents</span>
              <Zap className="w-3 h-3" />
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-orange-300/80">VISUAL</span>
                <span>3.501</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-300/80">SECURITY</span>
                <span>12.198</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-300/80">I18N</span>
                <span>118K</span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-orange-500/5 border border-orange-500/40 p-3 text-center">
            <div className="text-[10px] uppercase text-orange-400/70 tracking-widest mb-1">System Status</div>
            <div className="text-lg font-black tracking-widest text-orange-500 animate-pulse">SECURE</div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#121216]/60 border border-orange-500/30 p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ff6600_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between text-[10px] text-orange-500/60 tracking-widest">
            <span>LAT: 38.8951° N</span>
            <span>LON: 77.0364° W</span>
            <span>GRID: SECURE-09</span>
          </div>

          <div className="relative z-10 flex-grow flex flex-col items-center justify-center my-6">
            <div className="w-full h-64 md:h-80 border border-orange-500/20 bg-black/40 relative flex items-center justify-center overflow-hidden rounded">
              {mapNodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_12px_#ff6600] cursor-pointer hover:scale-150 transition-transform"
                  style={{ top: node.top, left: node.left }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              ))}

              {hoveredNode && (
                <div className="absolute z-30 bottom-4 left-4 bg-black/90 border border-orange-500 p-2 text-[10px] tracking-wider text-orange-400 backdrop-blur pointer-events-none shadow-[0_0_15px_rgba(255,102,0,0.4)]">
                  <div className="font-bold border-b border-orange-500/40 pb-1 mb-1 text-orange-300">
                    TELEMETRY // {hoveredNode.country}
                  </div>
                  <div>IP: {hoveredNode.ip}</div>
                  <div>ACTIVE CONNECTIONS: {hoveredNode.connections}</div>
                  <div>STATUS: {hoveredNode.status}</div>
                </div>
              )}

              <div className="absolute top-4 right-4 bg-black/80 border border-orange-500/50 px-3 py-1 text-center backdrop-blur">
                <span className="text-[10px] tracking-widest text-orange-400 block">LIVE FEED ACTIVE</span>
              </div>
            </div>

            <div className="w-full mt-4 bg-black border border-orange-500/40 p-2">
              <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1">
                <span>Security Threat Scan</span>
                <span className="animate-pulse">{threatScan}</span>
              </div>
              <div className="w-full h-1.5 bg-orange-950 rounded-none overflow-hidden">
                <div className="h-full bg-orange-500 shadow-[0_0_8px_#ff6600] w-[98.4%]"></div>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="border border-orange-500/40 py-2 bg-orange-500/10 cursor-pointer hover:bg-orange-500/20 transition">
              MAP MODE
            </div>
            <div className="border border-orange-500/40 py-2 bg-orange-500/10 cursor-pointer hover:bg-orange-500/20 transition">
              FILTER AGENTS
            </div>
            <div className="border border-orange-500/40 py-2 bg-orange-500/10 cursor-pointer hover:bg-orange-500/20 transition">
              VIVO PAY / CARGO MONITOR
            </div>
          </div>
        </div>

        <div className="bg-[#121216]/80 border border-orange-500/30 p-4 flex flex-col justify-between backdrop-blur-sm">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-orange-400 mb-3 border-b border-orange-500/20 pb-1">
              Top Categories
            </h2>
            <div className="space-y-3 text-xs mb-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-orange-300">ELECTRONICS</span>
                </div>
                <div className="w-full h-1 bg-orange-950">
                  <div className="h-full bg-orange-500 w-4/5"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-orange-300">MOTORS</span>
                </div>
                <div className="w-full h-1 bg-orange-950">
                  <div className="h-full bg-orange-500 w-3/5"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-orange-500/20 pt-4 bg-orange-500/[0.02] p-3 border border-orange-500/20">
            <h3 className="text-xs uppercase tracking-widest text-orange-400 mb-3 flex items-center justify-between">
              <span>Traffic Analytics</span>
              <Activity className="w-3.5 h-3.5" />
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-orange-500/60 uppercase tracking-wider">Total Users:</div>
                <div className="text-2xl font-black text-orange-400 tracking-wider">1.2M+</div>
              </div>
              <div>
                <div className="text-[10px] text-orange-500/60 uppercase tracking-wider">Last Hour:</div>
                <div className="text-xl font-bold text-orange-500 tracking-wider">154K</div>
              </div>
            </div>
          </div>

          <div className="mt-4 border border-orange-500/30 p-2 text-center text-[10px] tracking-widest uppercase text-orange-400/85">
            HOT RANGE: ACTIVE
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapDashboard;
