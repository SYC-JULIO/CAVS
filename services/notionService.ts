
import { AssessmentData } from "../types";
import { DIMENSION_NAMES } from "../constants";

// Security update: Read from environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Helper to sanitize text for Notion (limit 2000 chars)
const truncate = (str: string, length: number = 2000) => {
  return str.length > length ? str.substring(0, length - 3) + "..." : str;
};

// Convert Markdown text to Notion Blocks
const markdownToNotionBlocks = (markdown: string) => {
  const lines = markdown.split('\n');
  const blocks: any[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: truncate(trimmed.replace('### ', '')) } }]
        }
      });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: truncate(trimmed.replace('## ', '')) } }]
        }
      });
    } else if (trimmed.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: truncate(trimmed.replace('# ', '')) } }]
        }
      });
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('◆')) {
      // Clean up bold markers for cleaner Notion text, keep content
      const content = trimmed.replace(/^[\*\-◆]\s*/, '').replace(/\*\*/g, '');
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: truncate(content) } }]
        }
      });
    } else {
      // Paragraph
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: truncate(trimmed.replace(/\*\*/g, '')) } }]
        }
      });
    }
  });

  return blocks;
};

export const saveToNotion = async (data: AssessmentData, report: string) => {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    throw new Error("Configuration Error: Notion API Key or Database ID is missing. Please set NOTION_API_KEY and NOTION_DATABASE_ID in your environment variables.");
  }

  const url = 'https://api.notion.com/v1/pages';
  
  // Prepare Properties based on AssessmentData
  const properties = {
    "Name": { // Title property
      title: [{ text: { content: data.personalDetails.name || "未命名住戶" } }]
    },
    "Age": { // Number property
      number: parseInt(data.personalDetails.age) || 0
    },
    "Gender": { // Select property
      select: { name: data.personalDetails.gender || "未填寫" }
    },
    "Risk Level": { // Select property
      select: { name: data.riskLevel } // Green, Yellow, Red
    },
    "Total Score": { // Number property
      number: data.totalScore
    },
    "Dimensions Score": { // Rich Text for quick summary
        rich_text: [{ 
            text: { 
                content: `${DIMENSION_NAMES[0]}: ${data.dimensions.physical} | ${DIMENSION_NAMES[1]}: ${data.dimensions.family} | ${DIMENSION_NAMES[2]}: ${data.dimensions.mental} | ${DIMENSION_NAMES[3]}: ${data.dimensions.management}` 
            } 
        }]
    },
    "Assessment Date": { // Date property
        date: { start: new Date().toISOString() }
    }
  };

  // Convert report to blocks
  const reportBlocks = markdownToNotionBlocks(report);

  // Add a divider and the Person Brief before the AI report
  const children = [
    {
        object: 'block',
        type: 'callout',
        callout: {
            rich_text: [{ type: 'text', text: { content: `人物簡述: ${data.personBrief || "無"}` } }],
            icon: { emoji: "👤" }
        }
    },
    {
        object: 'block',
        type: 'divider',
        divider: {}
    },
    ...reportBlocks
  ];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: properties,
        children: children
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion API Error:", errorData);
      throw new Error(`Notion API Error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Save to Notion Failed:", error);
    throw error;
  }
};
