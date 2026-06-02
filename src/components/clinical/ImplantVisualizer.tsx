import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Line, Defs, LinearGradient, Stop, G, Circle } from 'react-native-svg';

interface ImplantVisualizerProps {
  diameter: number;
  length: number;
  type: string;
}

const ImplantVisualizer: React.FC<ImplantVisualizerProps> = ({ diameter, length, type }) => {
  // Normalize scale dimensions for visual display
  // Base visual container is 160x180
  const baseWidth = Math.max(26, Math.min(56, (diameter / 5.5) * 45));
  const baseHeight = Math.max(50, Math.min(90, (length / 15.0) * 75));
  
  // Calculate thread count based on length
  const threadCount = Math.max(3, Math.min(8, Math.floor(length / 2.0)));
  const threadSpacing = baseHeight / (threadCount + 1.2);

  // Determine collar color based on implant type
  let collarGradient = ['#3b82f6', '#60a5fa', '#1d4ed8']; // Default dynamic blue
  if (type.includes('Tapered')) {
    collarGradient = ['#f59e0b', '#fbbf24', '#b45309']; // Gold
  } else if (type.includes('Short')) {
    collarGradient = ['#ec4899', '#fbcfe8', '#be185d']; // Pink
  } else if (type.includes('Conservative')) {
    collarGradient = ['#10b981', '#34d399', '#047857']; // Teal/Green
  }

  return (
    <View style={styles.container}>
      <Svg width="160" height="180" viewBox="0 0 160 180" style={styles.svg}>
        <Defs>
          {/* Titanium Body Gradient */}
          <LinearGradient id="titanium" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#475569" />
            <Stop offset="35%" stopColor="#94a3b8" />
            <Stop offset="70%" stopColor="#cbd5e1" />
            <Stop offset="100%" stopColor="#334155" />
          </LinearGradient>
          
          {/* Dynamic Collar Gradient */}
          <LinearGradient id="collar" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={collarGradient[2]} />
            <Stop offset="35%" stopColor={collarGradient[1]} stopOpacity="0.9" />
            <Stop offset="75%" stopColor={collarGradient[0]} />
            <Stop offset="100%" stopColor={collarGradient[2]} />
          </LinearGradient>

          {/* Bone Texture Pattern */}
          <LinearGradient id="boneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#fafaf9" />
            <Stop offset="100%" stopColor="#f5f5f4" />
          </LinearGradient>

          {/* Gum/Gingiva Gradient */}
          <LinearGradient id="gumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#fda4af" />
            <Stop offset="50%" stopColor="#fecdd3" />
            <Stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Center alignment group */}
        <G transform="translate(80, 90)">
          
          {/* 1. Mandibular/Maxillar Bone Cross-section */}
          {/* Main bone body block */}
          <Path 
            d="M -70 -15 L 70 -15 L 70 80 Q 0 85 -70 80 Z" 
            fill="url(#boneGrad)" 
            stroke="#e7e5e4" 
            strokeWidth="1.5" 
          />
          {/* Trabecular Bone Dots representing high-density structure */}
          <Circle cx="-50" cy="15" r="1.5" fill="#d6d3d1" opacity="0.8" />
          <Circle cx="-35" cy="40" r="1.5" fill="#d6d3d1" opacity="0.8" />
          <Circle cx="-45" cy="60" r="1" fill="#d6d3d1" opacity="0.6" />
          <Circle cx="50" cy="20" r="1.5" fill="#d6d3d1" opacity="0.8" />
          <Circle cx="35" cy="45" r="1" fill="#d6d3d1" opacity="0.6" />
          <Circle cx="45" cy="55" r="1.5" fill="#d6d3d1" opacity="0.8" />
          <Circle cx="0" cy="65" r="1.2" fill="#d6d3d1" opacity="0.7" />

          {/* Pre-drilled surgical osteotomy socket channel */}
          <Path 
            d={`M ${-baseWidth*0.52} -15 L ${-baseWidth*0.42} ${baseHeight} Q 0 ${baseHeight + 6} ${baseWidth*0.42} ${baseHeight} L ${baseWidth*0.52} -15 Z`} 
            fill="#e2e8f0" 
            opacity="0.45" 
          />

          {/* 2. Pink Gum / Gingiva tissue wave */}
          <Path 
            d="M -72 -24 C -35 -30 -35 -15 0 -20 C 35 -24 35 -15 72 -20 L 70 -12 C 35 -8 35 -16 0 -12 C -35 -15 -35 -8 -70 -12 Z" 
            fill="url(#gumGrad)" 
          />

          {/* 3. Translucent Molar Tooth Crown Restoration Outline */}
          {/* Draws a beautiful clinical molar outline resting above the gums */}
          <Path 
            d="M -30 -66 C -32 -80 -18 -84 0 -82 C 18 -84 32 -80 30 -66 C 30 -44 24 -28 18 -26 C 18 -26 -18 -26 -18 -26 C -24 -28 -30 -44 -30 -66 Z" 
            fill="#ffffff" 
            fillOpacity="0.4" 
            stroke="#94a3b8" 
            strokeWidth="1.8" 
            strokeDasharray="3,3" 
          />
          {/* Internal pulp chamber hint */}
          <Path 
            d="M -12 -58 Q 0 -68 12 -58 C 10 -42 6 -32 0 -30 C -6 -32 -10 -42 -12 -58 Z" 
            fill="#e2e8f0" 
            fillOpacity="0.3" 
            stroke="#cbd5e1" 
            strokeWidth="1" 
          />

          {/* 4. CAD Calibration Grid Helper Lines */}
          <Line x1={-baseWidth/2 - 10} y1={-15} x2={baseWidth/2 + 10} y2={-15} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
          <Line x1={-baseWidth/2 - 10} y1={-15 + baseHeight} x2={baseWidth/2 + 10} y2={-15 + baseHeight} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
          
          {/* Vertical Height CAD Dimensions indicator line */}
          <Line x1={-baseWidth/2 - 10} y1={-15} x2={-baseWidth/2 - 10} y2={-15 + baseHeight} stroke="#3b82f6" strokeWidth="1.2" />
          <Path d={`M ${-baseWidth/2 - 13} ${-10} L ${-baseWidth/2 - 10} ${-15} L ${-baseWidth/2 - 7} ${-10}`} stroke="#3b82f6" fill="none" strokeWidth="1.2" />
          <Path d={`M ${-baseWidth/2 - 13} ${-20 + baseHeight} L ${-baseWidth/2 - 10} ${-15 + baseHeight} L ${-baseWidth/2 - 7} ${-20 + baseHeight}`} stroke="#3b82f6" fill="none" strokeWidth="1.2" />

          {/* Width CAD Dimensions indicator line */}
          <Line x1={-baseWidth/2} y1={-15 + baseHeight + 10} x2={baseWidth/2} y2={-15 + baseHeight + 10} stroke="#10b981" strokeWidth="1.2" />
          <Path d={`M ${-baseWidth/2 + 4} ${-18 + baseHeight + 10} L ${-baseWidth/2} ${-15 + baseHeight + 10} L ${-baseWidth/2 + 4} ${-12 + baseHeight + 10}`} stroke="#10b981" fill="none" strokeWidth="1.2" />
          <Path d={`M ${baseWidth/2 - 4} ${-18 + baseHeight + 10} L ${baseWidth/2} ${-15 + baseHeight + 10} L ${baseWidth/2 - 4} ${-12 + baseHeight + 10}`} stroke="#10b981" fill="none" strokeWidth="1.2" />

          {/* 5. Titanium Implant Screw */}
          {/* Implant hex head / abutment post extending up into crown */}
          <Path 
            d={`M ${-baseWidth*0.22} -26 L ${-baseWidth*0.28} -15 L ${baseWidth*0.28} -15 L ${baseWidth*0.22} -26 Z`} 
            fill="url(#collar)" 
          />
          
          {/* Implant collar (Solid Polished Titanium Collar) */}
          <Rect 
            x={-baseWidth/2} 
            y="-15" 
            width={baseWidth} 
            height="8" 
            rx="1.5" 
            ry="1.5" 
            fill="url(#collar)" 
          />
          
          {/* Implant core tapered body cylinder */}
          <Path 
            d={`M ${-baseWidth/2} -7 L ${baseWidth/2} -7 L ${baseWidth*0.4} ${-15 + baseHeight - 6} L ${-baseWidth*0.4} ${-15 + baseHeight - 6} Z`} 
            fill="url(#titanium)" 
          />
          
          {/* Rounded apex base */}
          <Path 
            d={`M ${-baseWidth*0.4} ${-15 + baseHeight - 6} Q 0 ${-15 + baseHeight + 3} ${baseWidth*0.4} ${-15 + baseHeight - 6} Z`} 
            fill="url(#titanium)" 
          />
          
          {/* Render threads dynamically along body */}
          {Array.from({ length: threadCount }).map((_, idx) => {
            const yPos = -7 + idx * threadSpacing;
            // Taper threads at the bottom
            const widthReduction = (idx / threadCount) * 0.16;
            const currentWidth = baseWidth * (1 - widthReduction);
            
            return (
              <Path 
                key={idx}
                d={`M ${-currentWidth/2} ${yPos} Q 0 ${yPos + 3} ${currentWidth/2} ${yPos + 1.5} L ${currentWidth/2 - 1.5} ${yPos + 4} Q 0 ${yPos + 6} ${-currentWidth/2 + 1.5} ${yPos + 4} Z`}
                fill="#334155"
                opacity="0.8"
              />
            );
          })}
        </G>
      </Svg>

      {/* CAD Overlay Labels */}
      <View style={[styles.labelBox, { left: 4, top: 85 }]}>
        <Text style={styles.labelTextBlue}>{length.toFixed(1)} mm</Text>
      </View>
      <View style={[styles.labelBox, { bottom: 6, left: 52 }]}>
        <Text style={styles.labelTextGreen}>Ø {diameter.toFixed(1)} mm</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 180,
    position: 'relative',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  svg: {
    alignSelf: 'center',
  },
  labelBox: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  labelTextBlue: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3b82f6',
  },
  labelTextGreen: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10b981',
  },
});

export default ImplantVisualizer;
