/**
 * Resume Generator Service
 * Handles generation and export of optimized resumes in DOCX format
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  UnderlineType,
} from 'docx';
import { OptimizedResume } from '../types';
import fs from 'fs';
import path from 'path';

/**
 * Create resume document structure
 * @param resume - Optimized resume data
 * @returns DOCX Document object
 *
 * TODO: Implement advanced document formatting:
 * - Professional styling and colors
 * - Proper spacing and margins
 * - Section dividers
 * - Hyperlinks for email and URLs
 * - Multiple resume templates (modern, classic, creative)
 * - Custom fonts and styling
 * - Left/right aligned sections
 * - Tables for better formatting
 */
export const createResumeDocument = (resume: OptimizedResume): Document => {
  const sections: Paragraph[] = [];

  // 1. Header - Personal Information
  sections.push(
    new Paragraph({
      text: resume.personalInfo.name || 'Your Name',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
      thematicBreak: false,
    })
  );

  // Contact Information
  const contactInfo = [
    resume.personalInfo.email || 'email@example.com',
    resume.personalInfo.phone || 'Phone',
    resume.personalInfo.location || 'Location',
  ]
    .filter(Boolean)
    .join(' | ');

  sections.push(
    new Paragraph({
      text: contactInfo,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // 2. Professional Summary / Job Title
  if (resume.jobTitle || resume.professionalSummary) {
    sections.push(
      new Paragraph({
        text: 'PROFESSIONAL SUMMARY',
        heading: HeadingLevel.HEADING_2,
        border: {
          bottom: {
            color: '000000',
            space: 100,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        spacing: { after: 100 },
      })
    );

    if (resume.jobTitle) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.jobTitle,
              bold: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );
    }

    if (resume.professionalSummary) {
      sections.push(
        new Paragraph({
          text: resume.professionalSummary,
          spacing: { after: 200 },
        })
      );
    }
  }

  // 3. Skills Section
  if (resume.skills && resume.skills.length > 0) {
    sections.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_2,
        border: {
          bottom: {
            color: '000000',
            space: 100,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        spacing: { after: 100 },
      })
    );

    const skillsText = resume.skills.map((skill) => skill.name).join(' • ');
    sections.push(
      new Paragraph({
        text: skillsText,
        spacing: { after: 200 },
      })
    );
  }

  // 4. Experience Section
  if (resume.experience && resume.experience.length > 0) {
    sections.push(
      new Paragraph({
        text: 'PROFESSIONAL EXPERIENCE',
        heading: HeadingLevel.HEADING_2,
        border: {
          bottom: {
            color: '000000',
            space: 100,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        spacing: { after: 100 },
      })
    );

    resume.experience.forEach((experience) => {
      // Job Title and Company
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${experience.jobTitle}`,
              bold: true,
            }),
            new TextRun({
              text: ` | ${experience.company}`,
              italics: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );

      // Dates
      const endDate = experience.currentlyWorking ? 'Present' : experience.endDate;
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${experience.startDate} - ${endDate}`,
              italics: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      // Description
      if (experience.description) {
        sections.push(
          new Paragraph({
            text: experience.description,
            spacing: { after: 50 },
          })
        );
      }

      // Responsibilities
      if (experience.responsibilities && experience.responsibilities.length > 0) {
        experience.responsibilities.forEach((responsibility) => {
          sections.push(
            new Paragraph({
              text: responsibility,
              spacing: { before: 0, after: 50 },
              indent: { left: 720 }, // Indented bullet point
            })
          );
        });
      }

      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 100 },
        })
      );
    });
  }

  // 5. Education Section
  if (resume.education && resume.education.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_2,
        border: {
          bottom: {
            color: '000000',
            space: 100,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        spacing: { after: 100 },
      })
    );

    resume.education.forEach((edu) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree}`,
              bold: true,
            }),
            new TextRun({
              text: ` | ${edu.institution}`,
              italics: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );

      sections.push(
        new Paragraph({
          text: `Graduated: ${edu.graduationDate}`,
          spacing: { after: 100 },
        })
      );
    });
  }

  // 6. Certifications Section
  if (resume.certifications && resume.certifications.length > 0) {
    sections.push(
      new Paragraph({
        text: 'CERTIFICATIONS',
        heading: HeadingLevel.HEADING_2,
        border: {
          bottom: {
            color: '000000',
            space: 100,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        spacing: { after: 100 },
      })
    );

    resume.certifications.forEach((cert) => {
      sections.push(
        new Paragraph({
          text: cert,
          spacing: { after: 50 },
        })
      );
    });
  }

  // 7. ATS Score and Suggestions (optional metadata)
  if (resume.atsScore) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `ATS Score: ${resume.atsScore}%`,
            italics: true,
            color: '666666',
          }),
        ],
        spacing: { before: 200 },
      })
    );
  }

  // Create and return the document
  return new Document({
    sections: [
      {
        children: sections,
        properties: {},
      },
    ],
  });
};

/**
 * Generate DOCX file from resume data
 * @param resume - Optimized resume object
 * @param outputPath - Path where to save the DOCX file
 * @returns Path to generated file
 *
 * TODO: Implement:
 * - Custom template selection
 * - Dynamic styling based on user preferences
 * - Image/photo inclusion
 * - QR code for online resume link
 */
export const generateDocxFile = async (
  resume: OptimizedResume,
  outputPath: string
): Promise<string> => {
  try {
    // Create document
    const doc = createResumeDocument(resume);

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Convert document to buffer and save to file
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    console.log(`Resume generated successfully at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating DOCX file:', error);
    throw new Error('Failed to generate resume file');
  }
};

/**
 * Generate DOCX buffer (for direct download)
 * @param resume - Optimized resume object
 * @returns Buffer containing DOCX data
 *
 * TODO: Stream buffer for large files
 * - Use async generators for memory efficiency
 * - Add progress tracking
 */
export const generateDocxBuffer = async (resume: OptimizedResume): Promise<Buffer> => {
  try {
    const doc = createResumeDocument(resume);
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error('Error generating DOCX buffer:', error);
    throw new Error('Failed to generate resume buffer');
  }
};

/**
 * Generate PDF file from resume data
 * @param resume - Optimized resume object
 * @param outputPath - Path where to save the PDF file
 * @returns Path to generated file
 *
 * TODO: Implement PDF generation:
 * - Install and configure pdf-lib or puppeteer
 * - Convert DOCX to PDF or generate PDF directly
 * - Add custom styling for PDF output
 * - Handle font embedding for better compatibility
 */
export const generatePdfFile = async (
  resume: OptimizedResume,
  outputPath: string
): Promise<string> => {
  try {
    // TODO: Implement PDF generation logic
    // Current implementation generates DOCX only

    console.warn('PDF generation not yet implemented. Generating DOCX instead.');
    return await generateDocxFile(resume, outputPath);
  } catch (error) {
    console.error('Error generating PDF file:', error);
    throw new Error('Failed to generate PDF file');
  }
};

/**
 * Generate resume with specified format
 * @param resume - Optimized resume object
 * @param format - Output format (docx or pdf)
 * @param outputPath - Path where to save the file
 * @returns Path to generated file
 */
export const generateResume = async (
  resume: OptimizedResume,
  format: 'docx' | 'pdf' = 'docx',
  outputPath: string
): Promise<string> => {
  if (format === 'pdf') {
    return await generatePdfFile(resume, outputPath);
  } else {
    return await generateDocxFile(resume, outputPath);
  }
};
