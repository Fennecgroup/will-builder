import type { WillContent, SpecificBequest, Asset, Beneficiary } from '@/lib/types/will';
import type { Value } from '@udecode/plate';
import type { BeneficiaryAssetLink, AutoFillResult, AutoFillOptions } from './types';

/**
 * Detects beneficiary-asset relationships from WillContent
 * Finds assets with beneficiaryAllocations that could be converted to specific bequests
 */
export function detectBeneficiaryAssetLinks(
  willContent: WillContent
): BeneficiaryAssetLink[] {
  const links: BeneficiaryAssetLink[] = [];
  const { assets, beneficiaries } = willContent;

  if (!assets || !beneficiaries) {
    return links;
  }

  // Create a map of beneficiaries by ID for quick lookup
  const beneficiaryMap = new Map<string, Beneficiary>();
  beneficiaries.forEach((ben) => {
    beneficiaryMap.set(ben.id, ben);
  });

  // Find assets with beneficiary allocations
  assets.forEach((asset) => {
    if (!asset.beneficiaryAllocations || asset.beneficiaryAllocations.length === 0) {
      return;
    }

    asset.beneficiaryAllocations.forEach((allocation) => {
      const beneficiary = beneficiaryMap.get(allocation.beneficiaryId);
      if (beneficiary) {
        links.push({
          assetId: asset.id,
          asset,
          beneficiaryId: allocation.beneficiaryId,
          beneficiary,
          percentage: allocation.percentage,
        });
      }
    });
  });

  return links;
}

/**
 * Checks if an asset already has a corresponding specific bequest
 * Uses multiple matching strategies to avoid duplicates
 */
function hasExistingBequest(
  asset: Asset,
  existingBequests: SpecificBequest[] = []
): boolean {
  if (!existingBequests || existingBequests.length === 0) {
    return false;
  }

  // Normalize asset description for comparison
  const assetDescriptionLower = asset.description.toLowerCase().trim();
  
  return existingBequests.some((bequest) => {
    const bequestDescriptionLower = bequest.description.toLowerCase().trim();
    
    // Strategy 1: Exact match or contains asset description
    if (bequestDescriptionLower === assetDescriptionLower ||
        bequestDescriptionLower.includes(assetDescriptionLower) ||
        assetDescriptionLower.includes(bequestDescriptionLower)) {
      return true;
    }

    // Strategy 2: Check for registration numbers or account numbers
    if (asset.notes) {
      const registrationMatch = asset.notes.match(/[Rr]egistration[:\s]+([A-Z0-9]+)/i);
      if (registrationMatch) {
        const regNumber = registrationMatch[1].toLowerCase();
        if (bequestDescriptionLower.includes(regNumber)) {
          return true;
        }
      }
      
      // Check if notes contain key identifying info
      const assetNotesLower = asset.notes.toLowerCase();
      const keyWords = assetNotesLower.split(/\s+/).filter(w => w.length > 3);
      if (keyWords.some(word => bequestDescriptionLower.includes(word))) {
        return true;
      }
    }

    // Strategy 3: Check account numbers (for bank accounts, investments)
    if (asset.accountNumber) {
      const accountNumber = asset.accountNumber.replace(/\*/g, '').toLowerCase();
      if (accountNumber.length > 4 && bequestDescriptionLower.includes(accountNumber)) {
        return true;
      }
    }

    // Strategy 4: For real estate, check location
    if (asset.type === 'real-estate' && asset.location) {
      const locationLower = asset.location.toLowerCase();
      if (bequestDescriptionLower.includes(locationLower)) {
        return true;
      }
    }

    // Strategy 5: Check for vehicle type matches (e.g., "BMW X5")
    if (asset.type === 'vehicle') {
      const vehicleKeywords = assetDescriptionLower.split(/\s+/).filter(w => 
        w.length > 2 && !['my', 'the', 'a', 'an'].includes(w)
      );
      const matches = vehicleKeywords.filter(keyword => 
        bequestDescriptionLower.includes(keyword)
      );
      // If multiple keywords match, likely the same vehicle
      if (matches.length >= 2) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Generates specific bequests from beneficiary-asset links
 */
export function generateSpecificBequests(
  links: BeneficiaryAssetLink[],
  existingBequests: SpecificBequest[] = [],
  options: AutoFillOptions = {}
): SpecificBequest[] {
  const {
    onlyFullAllocations = true,
    skipExisting = true,
  } = options;

  const newBequests: SpecificBequest[] = [];
  const processedAssets = new Set<string>();

  links.forEach((link) => {
    // Skip if we only want full allocations and this isn't 100%
    if (onlyFullAllocations && link.percentage !== 100) {
      return;
    }

    // Skip if asset already processed (for multi-beneficiary assets)
    if (processedAssets.has(link.assetId)) {
      return;
    }

    // Skip if asset already has a bequest
    if (skipExisting && hasExistingBequest(link.asset, existingBequests)) {
      return;
    }

    // Only create bequest if this is the sole beneficiary or the primary beneficiary (100%)
    if (link.percentage === 100) {
      // Build description from asset details
      let description = link.asset.description;
      
      // Add location for real estate
      if (link.asset.type === 'real-estate' && link.asset.location) {
        description += `, ${link.asset.location}`;
      }
      
      // Add registration/account number if available
      if (link.asset.notes) {
        const registrationMatch = link.asset.notes.match(/[Rr]egistration[:\s]+([A-Z0-9]+)/i);
        if (registrationMatch) {
          description += `, Registration ${registrationMatch[1]}`;
        }
      }

      // Generate unique ID for the bequest
      const bequestId = `bequest-auto-${link.assetId}-${Date.now()}`;

      newBequests.push({
        id: bequestId,
        description,
        beneficiaryId: link.beneficiaryId,
        // Optionally set substitute beneficiary (could be enhanced with logic)
      });

      processedAssets.add(link.assetId);
    }
  });

  return newBequests;
}

/**
 * Updates WillContent with new specific bequests
 * Safely merges without overwriting existing bequests
 */
export function updateWillContent(
  willContent: WillContent,
  newBequests: SpecificBequest[]
): WillContent {
  if (newBequests.length === 0) {
    return willContent;
  }

  const existingBequests = willContent.specificBequests || [];
  
  // Merge new bequests with existing ones, avoiding duplicates
  const mergedBequests = [...existingBequests];
  const addedDescriptions = new Set(
    existingBequests.map(b => b.description.toLowerCase().trim())
  );
  
  newBequests.forEach((newBequest) => {
    const newDescNormalized = newBequest.description.toLowerCase().trim();
    
    // Skip if exact duplicate
    if (addedDescriptions.has(newDescNormalized)) {
      return;
    }

    // Check for similar descriptions (fuzzy match)
    const isSimilar = mergedBequests.some((existing) => {
      const existingDesc = existing.description.toLowerCase().trim();
      
      // Exact match
      if (existingDesc === newDescNormalized) {
        return true;
      }
      
      // One contains the other (for partial matches)
      if (existingDesc.includes(newDescNormalized) || 
          newDescNormalized.includes(existingDesc)) {
        // Only consider it similar if the overlap is significant (>50% of shorter string)
        const shorter = Math.min(existingDesc.length, newDescNormalized.length);
        const longer = Math.max(existingDesc.length, newDescNormalized.length);
        if (shorter / longer > 0.5) {
          return true;
        }
      }
      
      return false;
    });

    if (!isSimilar) {
      mergedBequests.push(newBequest);
      addedDescriptions.add(newDescNormalized);
    }
  });

  return {
    ...willContent,
    specificBequests: mergedBequests,
  };
}

/**
 * Finds or creates the SPECIFIC BEQUESTS section in editor content
 */
function findOrCreateBequestsSection(editorContent: Value): {
  sectionIndex: number;
  listIndex: number | null;
} {
  let sectionIndex = -1;
  let listIndex: number | null = null;

  // Look for "ARTICLE VII - SPECIFIC BEQUESTS" or similar heading
  for (let i = 0; i < editorContent.length; i++) {
    const node = editorContent[i];
    
    if (node.type === 'h3' && node.children) {
      const text = node.children
        .map((child: any) => child.text || '')
        .join('')
        .toLowerCase();
      
      if (text.includes('specific bequest') || text.includes('article vii')) {
        sectionIndex = i;
        
        // Look for the list that follows this heading
        for (let j = i + 1; j < editorContent.length; j++) {
          const nextNode = editorContent[j];
          if (nextNode.type === 'ul' || nextNode.type === 'ol') {
            listIndex = j;
            break;
          }
          // Stop if we hit another heading
          if (nextNode.type === 'h3' || nextNode.type === 'h2' || nextNode.type === 'h1') {
            break;
          }
        }
        break;
      }
    }
  }

  return { sectionIndex, listIndex };
}

/**
 * Generates Plate.js editor nodes for bequests
 */
function generateBequestEditorNodes(
  bequests: SpecificBequest[],
  beneficiaries: Beneficiary[]
): any[] {
  const beneficiaryMap = new Map<string, Beneficiary>();
  beneficiaries.forEach((ben) => {
    beneficiaryMap.set(ben.id, ben);
  });

  return bequests.map((bequest) => {
    const beneficiary = beneficiaryMap.get(bequest.beneficiaryId);
    const beneficiaryName = beneficiary?.fullName || 'Unknown';
    const relationship = beneficiary?.relationship || '';

    // Format: "To [beneficiary name] ([relationship]): [asset description]"
    const text = `To ${beneficiaryName}${relationship ? ` (${relationship})` : ''}: ${bequest.description}`;

    return {
      type: 'li',
      children: [{ text }],
    };
  });
}

/**
 * Updates editor content with new bequests
 */
export function updateEditorContentWithBequests(
  editorContent: Value,
  newBequests: SpecificBequest[],
  beneficiaries: Beneficiary[]
): Value {
  if (newBequests.length === 0) {
    return editorContent;
  }

  const { sectionIndex, listIndex } = findOrCreateBequestsSection(editorContent);

  if (sectionIndex === -1) {
    // Section doesn't exist, we'll append it (could be enhanced to insert at appropriate location)
    const bequestNodes = generateBequestEditorNodes(newBequests, beneficiaries);
    
    return [
      ...editorContent,
      {
        type: 'h3',
        children: [{ text: 'ARTICLE VII - SPECIFIC BEQUESTS' }],
      },
      {
        type: 'p',
        children: [{ text: 'I give, devise, and bequeath the following specific items:' }],
      },
      {
        type: 'ul',
        children: bequestNodes,
      },
      {
        type: 'p',
        children: [{ text: '' }],
      },
    ] as Value;
  }

  // Section exists, update the list
  const updatedContent = [...editorContent];
  
  if (listIndex !== null) {
    // Update existing list
    const existingList = updatedContent[listIndex];
    const existingItems = existingList.children || [];
    const newItems = generateBequestEditorNodes(newBequests, beneficiaries);
    
    // Merge new items, avoiding duplicates
    const mergedItems = [...existingItems];
    newItems.forEach((newItem) => {
      const newText = newItem.children[0]?.text || '';
      const exists = existingItems.some((existing: any) => {
        const existingText = existing.children?.[0]?.text || '';
        return existingText.toLowerCase() === newText.toLowerCase();
      });
      
      if (!exists) {
        mergedItems.push(newItem);
      }
    });

    updatedContent[listIndex] = {
      ...existingList,
      children: mergedItems,
    };
  } else {
    // No list found, insert one after the heading
    const insertIndex = sectionIndex + 1;
    const newItems = generateBequestEditorNodes(newBequests, beneficiaries);
    
    updatedContent.splice(insertIndex, 0, {
      type: 'p',
      children: [{ text: 'I give, devise, and bequeath the following specific items:' }],
    }, {
      type: 'ul',
      children: newItems,
    });
  }

  return updatedContent as Value;
}

/**
 * Validates that required data exists before auto-filling
 */
function validateWillContent(willContent: WillContent): { valid: boolean; error?: string } {
  if (!willContent.assets || willContent.assets.length === 0) {
    return { valid: false, error: 'No assets found' };
  }

  if (!willContent.beneficiaries || willContent.beneficiaries.length === 0) {
    return { valid: false, error: 'No beneficiaries found' };
  }

  return { valid: true };
}

/**
 * Main auto-fill function that processes WillContent and returns updated content
 * Includes safety checks and validation
 */
export function autoFillWillSections(
  willContent: WillContent,
  editorContent: Value,
  options: AutoFillOptions = {}
): AutoFillResult {
  const {
    updateEditorContent = true,
  } = options;

  // Validate input
  const validation = validateWillContent(willContent);
  if (!validation.valid) {
    return {
      newBequests: [],
      updatedWillContent: willContent,
      updatedEditorContent: editorContent,
      hasChanges: false,
    };
  }

  // Detect beneficiary-asset links
  const links = detectBeneficiaryAssetLinks(willContent);

  if (links.length === 0) {
    return {
      newBequests: [],
      updatedWillContent: willContent,
      updatedEditorContent: editorContent,
      hasChanges: false,
    };
  }

  // Generate new bequests
  const existingBequests = willContent.specificBequests || [];
  const newBequests = generateSpecificBequests(links, existingBequests, options);

  if (newBequests.length === 0) {
    return {
      newBequests: [],
      updatedWillContent: willContent,
      updatedEditorContent: editorContent,
      hasChanges: false,
    };
  }

  // Validate that beneficiaries exist for all new bequests
  const beneficiaryIds = new Set(willContent.beneficiaries?.map(b => b.id) || []);
  const validBequests = newBequests.filter(bequest => 
    beneficiaryIds.has(bequest.beneficiaryId)
  );

  if (validBequests.length === 0) {
    return {
      newBequests: [],
      updatedWillContent: willContent,
      updatedEditorContent: editorContent,
      hasChanges: false,
    };
  }

  // Update will content
  const updatedWillContent = updateWillContent(willContent, validBequests);

  // Update editor content if requested
  let updatedEditorContent = editorContent;
  if (updateEditorContent && Array.isArray(editorContent)) {
    try {
      updatedEditorContent = updateEditorContentWithBequests(
        editorContent,
        validBequests,
        willContent.beneficiaries || []
      );
    } catch (error) {
      console.error('Error updating editor content:', error);
      // Fall back to not updating editor content if there's an error
      updatedEditorContent = editorContent;
    }
  }

  return {
    newBequests: validBequests,
    updatedWillContent,
    updatedEditorContent,
    hasChanges: true,
  };
}

