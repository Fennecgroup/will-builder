'use client';

import {
  User,
  Heart,
  Building2,
  Users,
  UserCheck,
  Eye,
  Shield,
  Scale,
  CreditCard,
  Flower2,
  Globe,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Hash,
  Key,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { WillContent } from '@/lib/types/will';

interface TestatorSidebarProps {
  willContent: WillContent;
}

function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
      <div>
        <span className="text-neutral-500">{label}:</span>{' '}
        <span className="text-neutral-900 dark:text-neutral-100">{value}</span>
      </div>
    </div>
  );
}

export function TestatorSidebar({ willContent }: TestatorSidebarProps) {
  const {
    testator,
    marriage,
    children,
    assets,
    beneficiaries,
    executors,
    witnesses,
    guardians,
    trustees,
    liabilities,
    funeralWishes,
    digitalAssets,
  } = willContent;

  const totalAssetValue = assets?.reduce((sum, asset) => sum + (asset.estimatedValue || 0), 0) || 0;
  const totalLiabilities = liabilities?.reduce((sum, liability) => sum + liability.amount, 0) || 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Testator Details
        </h2>

        <Accordion type="multiple" defaultValue={['personal', 'marriage', 'assets', 'beneficiaries']} className="w-full">
          {/* Personal Information */}
          {testator && (
            <AccordionItem value="personal">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  <InfoRow icon={User} label="Name" value={testator.fullName} />
                  <InfoRow icon={Calendar} label="DOB" value={formatDate(testator.dateOfBirth)} />
                  <InfoRow icon={Hash} label="ID" value={testator.idNumber} />
                  {testator.address && (
                    <InfoRow
                      icon={MapPin}
                      label="Address"
                      value={`${testator.address.street}, ${testator.address.city}, ${testator.address.state} ${testator.address.postalCode}`}
                    />
                  )}
                  <InfoRow icon={Phone} label="Phone" value={testator.phone} />
                  <InfoRow icon={Mail} label="Email" value={testator.email} />
                  {testator.occupation && (
                    <InfoRow icon={Building2} label="Occupation" value={testator.occupation} />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Marriage Status */}
          {marriage && (
            <AccordionItem value="marriage">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Marriage Status
                  <Badge variant="secondary" className="ml-2 text-xs capitalize">
                    {marriage.status}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {marriage.spouses && marriage.spouses.length > 0 && (
                    <>
                      {marriage.spouses.map((spouse, idx) => (
                        <div key={spouse.id || idx}>
                          <InfoRow icon={User} label="Spouse" value={spouse.fullName} />
                          {spouse.dateOfMarriage && (
                            <InfoRow
                              icon={Calendar}
                              label="Married"
                              value={formatDate(spouse.dateOfMarriage)}
                            />
                          )}
                        </div>
                      ))}
                    </>
                  )}
                  <InfoRow
                    icon={Users}
                    label="Children"
                    value={children && children.length > 0 
                      ? `Yes (${children.length})` 
                      : 'No'}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Assets */}
          <AccordionItem value="assets">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Assets
                <Badge variant="secondary" className="ml-2 text-xs">
                  {assets?.length || 0} items
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Total Value: {formatCurrency(totalAssetValue)}
                </div>
                {/* Create beneficiaries map for efficient ID-to-name lookups */}
                {(() => {
                  const beneficiariesMap = new Map(
                    beneficiaries?.map(b => [b.id, b]) || []
                  );
                  return assets?.map((asset) => {
                    const hasAllocations = asset.beneficiaryAllocations && asset.beneficiaryAllocations.length > 0;
                    return (
                    <div key={asset.id} className="border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {asset.description}
                      </div>
                      <div className="text-xs text-neutral-500">
                        <span className="capitalize">{asset.type.replace('-', ' ')}</span>
                        {asset.estimatedValue && (
                          <> • {formatCurrency(asset.estimatedValue, asset.currency)}</>
                        )}
                      </div>
                      {asset.location && (
                        <div className="text-xs text-neutral-500">{asset.location}</div>
                      )}
                      {hasAllocations ? (
                        <div className="mt-2 space-y-1">
                          {asset.beneficiaryAllocations?.map((allocation, idx) => {
                            const beneficiary = beneficiariesMap.get(allocation.beneficiaryId);
                            return beneficiary ? (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {allocation.percentage}%
                                </Badge>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                  {beneficiary.fullName}
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : asset.usufruct ? (
                        <div className="mt-2 space-y-2">
                          <Badge variant="outline" className="text-xs border-purple-400 text-purple-700 dark:border-purple-500 dark:text-purple-400">
                            Usufruct
                          </Badge>
                          <div className="space-y-1.5">
                            {/* Usufructuary */}
                            <div className="flex items-start gap-2 text-xs">
                              <UserCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                              <div className="flex-1">
                                <span className="text-neutral-500">Usufructuary:</span>
                                <span className="ml-1 text-neutral-900 dark:text-neutral-100 font-medium">
                                  {beneficiariesMap.get(asset.usufruct.usufructuaryId)?.fullName || 'Unknown'}
                                </span>
                              </div>
                            </div>

                            {/* Bare Dominium Owner */}
                            <div className="flex items-start gap-2 text-xs">
                              <Key className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                              <div className="flex-1">
                                <span className="text-neutral-500">Bare Owner:</span>
                                <span className="ml-1 text-neutral-900 dark:text-neutral-100 font-medium">
                                  {beneficiariesMap.get(asset.usufruct.bareDominiumOwnerId)?.fullName || 'Unknown'}
                                </span>
                              </div>
                            </div>

                            {/* Termination info */}
                            <div className="text-xs text-neutral-400 italic pl-5">
                              Full ownership vests upon usufructuary's death
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Unassigned
                        </Badge>
                      )}
                    </div>
                    );
                  });
                })()}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Beneficiaries */}
          <AccordionItem value="beneficiaries">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Beneficiaries
                <Badge variant="secondary" className="ml-2 text-xs">
                  {beneficiaries?.length || 0}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                {beneficiaries?.map((beneficiary) => {
                  // Find all assets allocated to this beneficiary
                  const allocatedAssets = assets?.filter(asset =>
                    asset.beneficiaryAllocations?.some(alloc => alloc.beneficiaryId === beneficiary.id)
                  ) || [];
                  
                  // Calculate total allocation value
                  const totalAllocationValue = allocatedAssets.reduce((sum, asset) => {
                    const allocation = asset.beneficiaryAllocations?.find(alloc => alloc.beneficiaryId === beneficiary.id);
                    if (allocation && asset.estimatedValue) {
                      return sum + (asset.estimatedValue * allocation.percentage / 100);
                    }
                    return sum;
                  }, 0);

                  return (
                    <div key={beneficiary.id} className="border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {beneficiary.fullName}
                        {beneficiary.allocationPercentage && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {beneficiary.allocationPercentage}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">{beneficiary.relationship}</div>
                      {allocatedAssets.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            Allocated Assets:
                          </div>
                          {allocatedAssets.map((asset) => {
                            const allocation = asset.beneficiaryAllocations?.find(alloc => alloc.beneficiaryId === beneficiary.id);
                            const allocationValue = allocation && asset.estimatedValue
                              ? asset.estimatedValue * allocation.percentage / 100
                              : 0;
                            return (
                              <div key={asset.id} className="flex items-center gap-2 text-xs text-neutral-500">
                                <Badge variant="outline" className="text-xs">
                                  {allocation?.percentage}%
                                </Badge>
                                <span className="flex-1">{asset.description}</span>
                                {allocationValue > 0 && (
                                  <span className="text-neutral-600 dark:text-neutral-400">
                                    {formatCurrency(allocationValue, asset.currency)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {totalAllocationValue > 0 && (
                            <div className="mt-1 pt-1 border-t border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-neutral-100">
                              Total Allocation: {formatCurrency(totalAllocationValue, allocatedAssets.find(a => a.estimatedValue)?.currency || 'ZAR')}
                            </div>
                          )}
                        </div>
                      )}
                      {beneficiary.specificBequests && beneficiary.specificBequests.length > 0 && (
                        <div className="mt-1 text-xs text-neutral-500">
                          Bequests: {beneficiary.specificBequests.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Executor */}
          <AccordionItem value="executor">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Executor
                <Badge variant="secondary" className="ml-2 text-xs">
                  {executors?.length || 0}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                {executors?.map((executor) => (
                  <div key={executor.id} className="border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {executor.fullName}
                      {executor.isAlternate && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Alternate
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500">{executor.relationship}</div>
                    <div className="text-xs text-neutral-500">{executor.phone}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Witnesses */}
          <AccordionItem value="witnesses">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Witnesses
                <Badge variant="secondary" className="ml-2 text-xs">
                  {witnesses?.length || 0}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                {witnesses?.map((witness) => (
                  <div key={witness.id} className="border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {witness.fullName}
                    </div>
                    {witness.occupation && (
                      <div className="text-xs text-neutral-500">{witness.occupation}</div>
                    )}
                    {witness.phone && (
                      <div className="text-xs text-neutral-500">{witness.phone}</div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Guardians */}
          {(guardians?.length || 0) > 0 && (
            <AccordionItem value="guardians">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Guardians
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {guardians?.length || 0}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pl-6">
                  {guardians?.map((guardian) => (
                    <div key={guardian.id} className="border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {guardian.fullName}
                        {guardian.isAlternate && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Alternate
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">{guardian.relationship}</div>
                      <div className="text-xs text-neutral-500">
                        For: {guardian.forChildren.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Trustees */}
          {(trustees?.length || 0) > 0 && (
            <AccordionItem value="trustees">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Trustees
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {trustees?.length || 0}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pl-6">
                  {trustees?.map((trustee) => {
                    // Find beneficiaries managed by this trustee
                    const managedBeneficiaries = beneficiaries?.filter(b =>
                      trustee.forBeneficiaries.includes(b.id)
                    ) || [];

                    return (
                      <div key={trustee.id} className="border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {trustee.fullName}
                          {trustee.isAlternate && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Alternate
                            </Badge>
                          )}
                          {trustee.isGuardian && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Also Guardian
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500">{trustee.relationship}</div>
                        {managedBeneficiaries.length > 0 && (
                          <div className="text-xs text-neutral-500">
                            Managing for: {managedBeneficiaries.map(b => b.fullName).join(', ')}
                          </div>
                        )}
                        {trustee.phone && (
                          <div className="text-xs text-neutral-500">{trustee.phone}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Debts & Liabilities */}
          <AccordionItem value="liabilities">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Debts & Liabilities
                <Badge variant="secondary" className="ml-2 text-xs">
                  {liabilities?.length || 0}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Total: {formatCurrency(totalLiabilities)}
                </div>
                {liabilities?.map((liability) => (
                  <div key={liability.id} className="border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {liability.creditor}
                    </div>
                    <div className="text-xs text-neutral-500">
                      <span className="capitalize">{liability.type}</span> •{' '}
                      {formatCurrency(liability.amount, liability.currency)}
                    </div>
                    {liability.notes && (
                      <div className="text-xs text-neutral-500">{liability.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Funeral Wishes */}
          {funeralWishes && (
            <AccordionItem value="funeral">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Flower2 className="h-4 w-4" />
                  Funeral Wishes
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  <div className="text-sm">
                    <span className="text-neutral-500">Preference:</span>{' '}
                    <span className="capitalize text-neutral-900 dark:text-neutral-100">
                      {funeralWishes.preference}
                    </span>
                  </div>
                  {funeralWishes.location && (
                    <div className="text-sm">
                      <span className="text-neutral-500">Location:</span>{' '}
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {funeralWishes.location}
                      </span>
                    </div>
                  )}
                  {funeralWishes.funeralHome && (
                    <div className="text-sm">
                      <span className="text-neutral-500">Funeral Home:</span>{' '}
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {funeralWishes.funeralHome}
                      </span>
                    </div>
                  )}
                  {funeralWishes.prePaid && (
                    <Badge variant="secondary" className="text-xs">
                      Pre-paid
                    </Badge>
                  )}
                  {funeralWishes.specificInstructions && (
                    <div className="mt-2 text-xs text-neutral-500">
                      {funeralWishes.specificInstructions}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Digital Assets */}
          <AccordionItem value="digital">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Digital Assets
                <Badge variant="secondary" className="ml-2 text-xs">
                  {digitalAssets?.length || 0}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                {digitalAssets?.map((asset) => (
                  <div key={asset.id} className="border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {asset.platform}
                    </div>
                    <div className="text-xs text-neutral-500 capitalize">
                      {asset.type.replace('-', ' ')}
                    </div>
                    {asset.username && (
                      <div className="text-xs text-neutral-500">{asset.username}</div>
                    )}
                    <div className="mt-1 text-xs text-neutral-500">{asset.instructions}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Summary Stats */}
        <div className="mt-6 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
          <h3 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Estate Summary
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Total Assets:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(totalAssetValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Total Liabilities:</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(totalLiabilities)}
              </span>
            </div>
            <div className="border-t border-neutral-200 pt-1 dark:border-neutral-700">
              <div className="flex justify-between">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  Net Estate:
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(totalAssetValue - totalLiabilities)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
