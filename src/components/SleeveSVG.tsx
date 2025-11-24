import React from 'react';
import type { CardDimensions, Card } from '../types/sleeve';
import { ManaSymbol } from './ManaSymbols';

interface SleeveProps {
  themeName: string;
  themeImageUrl?: string;
  cardList?: Card[];
  dimensions: CardDimensions;
  colors?: string;
  collectorCode?: string;
  variant?: string;
}

const SleeveSVG: React.FC<SleeveProps> = ({
  themeName,
  themeImageUrl,
  cardList,
  dimensions,
  colors,
  collectorCode,
  variant,
}) => {
  const { width, height, thickness } = dimensions;
  
  // Calculate sleeve dimensions (front, top, back, bottom, bottom2)
  const paperThickness = 0.1; // mm for the paper layer
  const sleeveWidth = width;
  const frontHeight = height;
  const backHeight = height + paperThickness;
  const topHeight = thickness * 20;
  const bottomHeight = thickness * 20;
  const sleeveHeight = frontHeight + topHeight + backHeight + bottomHeight * 2;
  
  // Margins and padding
  const padding = 2; // mm
  const fontSize = Math.min(topHeight - 2, 6); // mm
  const cardListFontSize = 3; // mm
  
  // Parse mana symbols from colors string (e.g., "{W}{U}" or "{W}" or "{C}")
  const manaSymbols = colors?.match(/\{[WUBRGC]\}/g) || [];
  
  const manaSymbolSize = manaSymbols.length > 2 ? 3 : 4; // mm
  const manaSymbolSpacing = manaSymbols.length > 2 ? 0.3 : 0.5; // mm between symbols
  
  return (
    <svg
      width={`${sleeveWidth}mm`}
      height={`${sleeveHeight + 0.2}mm`}
      viewBox={`0 0 ${sleeveWidth} ${sleeveHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      className="sleeve-svg"
    >
      {/* Front section - Theme Image */}
    <g id="front" transform={`translate(0, ${bottomHeight}) rotate(180 ${sleeveWidth / 2} ${frontHeight / 2})`}>
      <rect
        x="0"
        y="0"
        width={sleeveWidth}
        height={frontHeight}
        fill="#fff"
        stroke="#000"
        strokeWidth="0.2"
      />
      {themeImageUrl && (
        <>
        <defs>
          {/* Clip 5% from each side using objectBoundingBox (0..1 coords) */}
          <clipPath id="clip-front" clipPathUnits="objectBoundingBox">
            <rect x="0.045" y="0.03" width="0.91" height="0.94" />
          </clipPath>
        </defs>
        {(() => {
          // Input image aspect ratio (5/7)
          const imageAspectRatio = 5 / 7;
          // Target area aspect ratio
          const targetAspectRatio = sleeveWidth / frontHeight;
          
          let imgWidth: number, imgHeight: number, imgX: number, imgY: number;
          
          if (targetAspectRatio > imageAspectRatio) {
            // Target is wider - fit to height
            imgHeight = frontHeight;
            imgWidth = frontHeight * imageAspectRatio;
            imgX = (sleeveWidth - imgWidth) / 2;
            imgY = 0;
          } else {
            // Target is taller - fit to width
            imgWidth = sleeveWidth;
            imgHeight = sleeveWidth / imageAspectRatio;
            imgX = 0;
            imgY = (frontHeight - imgHeight) / 2;
          }
          
          return (
            <image
              href={themeImageUrl}
              x={imgX}
              y={imgY}
              width={imgWidth}
              height={imgHeight}
              preserveAspectRatio="none"
              clipPath="url(#clip-front)"
            />
          );
        })()}
        </>
      )}
    </g>

      {/* Top section - Theme Name */}
      <g id="top" transform={`translate(0, ${frontHeight + bottomHeight})`}>
        <rect
          x="0"
          y="0"
          width={sleeveWidth}
          height={topHeight}
          fill="#ffffff"
          stroke="#000"
          strokeWidth="0.2"
        />
        
        {/* Collector code - left aligned */}
        {collectorCode && (
          <text
            x={padding}
            y={topHeight / 2}
            fontSize={2.5}
            fontWeight="normal"
            fontFamily="'Bebas Neue', Arial, sans-serif"
            textAnchor="start"
            dominantBaseline="middle"
            fill="#666"
          >
            {collectorCode}
          </text>
        )}
        
        <text
          x={sleeveWidth / 2}
          y={topHeight / 2}
          fontSize={fontSize}
          fontWeight="normal"
          fontFamily="'Bebas Neue', Arial, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#000"
        >
        {themeName.toUpperCase()}
        {variant && (
            <tspan fill="#666">
                {' ' + variant}
            </tspan>
        )}
        </text>
        
        {/* Mana symbols - right aligned */}
        {manaSymbols.length > 0 && (
          <g id="mana-symbols">
            {manaSymbols.map((symbol, index) => {
              const x = sleeveWidth - padding - (manaSymbols.length - index) * (manaSymbolSize + manaSymbolSpacing);
              const y = topHeight / 2 - manaSymbolSize / 2;
              
              return (
                <ManaSymbol
                  key={index}
                  symbol={symbol}
                  size={manaSymbolSize}
                  x={x}
                  y={y}
                />
              );
            })}
          </g>
        )}
      </g>

      {/* Back section - Card List */}
      <g id="back" transform={`translate(0, ${frontHeight + topHeight + bottomHeight})`}>
        <rect
          x="0"
          y="0"
          width={sleeveWidth}
          height={backHeight}
          fill="#ffffff"
          stroke="#000"
          strokeWidth="0.2"
        />
        
        {cardList && (
          <text
            x={sleeveWidth / 2}
            y={padding + cardListFontSize}
            fontSize={cardListFontSize * 1.5}
            fontWeight="bold"
            fontFamily="'Bebas Neue', Arial, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#000"
          >
            {themeName.toUpperCase()}
          </text>
        )}
        
        {cardList?.map((card, index) => {
          const displayText = card.count > 1 ? `${card.count}x ${card.name}` : card.name;
        const manaSymbolsForCard = (card.castingCost || '').match(/\{[^}]+\}/g) || [];

        const manaSymbolElements = (() => {
            if (manaSymbolsForCard.length === 0) return null;

            const count = manaSymbolsForCard.length;
            const cardManaSymbolSize = 2.5; // mm - smaller size for card list
            const cardManaSymbolSpacing = 0.3; // mm - smaller spacing for card list
            const totalWidth = count * cardManaSymbolSize + Math.max(0, count - 1) * cardManaSymbolSpacing;
            const startX = sleeveWidth - padding - totalWidth;
            // match the same lineHeight used below in the row rendering
            const lineHeight = cardListFontSize + 0.5;
            const headerOffset = cardListFontSize * 2.5; // Space for header
            const rectY = padding + headerOffset + index * lineHeight;
            const textY = rectY + lineHeight / 2;
            const y = textY - cardManaSymbolSize / 2;

            return (
                <>
                    {manaSymbolsForCard.map((sym, si) => (
                        <ManaSymbol
                            key={`ms-${index}-${si}`}
                            symbol={sym}
                            size={cardManaSymbolSize}
                            x={startX + si * (cardManaSymbolSize + cardManaSymbolSpacing)}
                            y={y}
                        />
                    ))}
                </>
            );
        })();
          return (
            <g key={index}>
              {/*
                Use a rect as a background for alternating rows.
                Calculate a consistent lineHeight and center the text vertically.
              */}
              {(() => {
                const lineHeight = cardListFontSize + 0.5;
                const headerOffset = cardListFontSize * 2.5; // Space for header
                const rectY = padding + headerOffset + index * lineHeight;
                const rectHeight = lineHeight;
                const textY = rectY + rectHeight / 2;
                return (
                  <>
                    {index % 2 === 0 && (
                      <rect
                        x={padding}
                        y={rectY}
                        width={sleeveWidth - padding * 2}
                        height={rectHeight}
                        fill="#e6e6e6"
                      />
                    )}
                    {manaSymbolElements}
                    <text
                      x={padding + 1}
                      y={textY}
                      fontSize={cardListFontSize}
                      fontFamily={`"Open Sans", Arial, sans-serif`}
                      fill="#000"
                      dominantBaseline="middle"
                    >
                      {displayText}
                    </text>
                  </>
                );
              })()}
            </g>
          );
        })}
      </g>

      {/* Bottom section 1 - For wrapping */}
      <g id="bottom1" transform={`translate(0, ${frontHeight + backHeight + topHeight + bottomHeight})`}>
        <rect
          x="0"
          y="0"
          width={sleeveWidth}
          height={bottomHeight}
          fill="#fff"
          stroke="#000"
          strokeWidth="0.2"
        />
      </g>

      {/* Bottom section 2 - Double bottom for gluing */}
      <g id="bottom2" transform={`translate(0, 0)`}>
        <rect
          x="0"
          y="0"
          width={sleeveWidth}
          height={bottomHeight}
          fill="#fff"
          stroke="#000"
          strokeWidth="0.2"
          strokeDasharray="1,1"
        />
        <text
          x={sleeveWidth / 2}
          y={bottomHeight / 2}
          fontSize={fontSize * 0.8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#aaa"
        >
          GLUE HERE
        </text>
      </g>
    </svg>
  );
};

export default SleeveSVG;
