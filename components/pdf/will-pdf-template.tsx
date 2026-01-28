import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { WillContent } from '@/lib/types/will'
import { getPresentArticles, createPdfArticleTitles } from '@/lib/auto-fill/pdf-utils'

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  legalReference: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 8,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#000',
    textDecoration: 'underline',
  },
  text: {
    marginBottom: 5,
    lineHeight: 1.6,
  },
  bold: {
    fontWeight: 'bold',
  },
  listItem: {
    marginLeft: 20,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginVertical: 20,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    fontSize: 9,
    color: '#666',
  },
  warning: {
    backgroundColor: '#fff3cd',
    padding: 10,
    marginBottom: 15,
    fontSize: 9,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  signatureBlock: {
    marginTop: 25,
    marginBottom: 10,
  },
  signatureLine: {
    marginTop: 35,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
})

interface WillPDFTemplateProps {
  title: string
  content: WillContent
  createdAt: Date
}

export function WillPDFTemplate({ title, content, createdAt }: WillPDFTemplateProps) {
  // Calculate which articles are present and generate dynamic numbering
  const presentArticles = getPresentArticles(content)
  const articleTitles = createPdfArticleTitles(presentArticles)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LAST WILL AND TESTAMENT</Text>
          <Text style={styles.subtitle}>{title}</Text>
          <Text style={styles.legalReference}>In terms of the Wills Act 7 of 1953</Text>
        </View>

        {/* Important Warning */}
        <View style={styles.warning}>
          <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>⚠ IMPORTANT LEGAL NOTICE:</Text>
          <Text>
            This Will MUST be signed with PHYSICAL signatures by the Testator and TWO witnesses who
            are all present at the SAME TIME. Digital/electronic signatures are NOT valid under South
            African law.
          </Text>
        </View>

        {/* Revocation */}
        {content.revocationClause && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{articleTitles.REVOCATION}</Text>
            <Text style={styles.text}>{content.revocationClause}</Text>
          </View>
        )}

        {/* Declaration */}
        {content.testator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{articleTitles.DECLARATION}</Text>
            <Text style={styles.text}>
              I, <Text style={styles.bold}>{content.testator.fullName}</Text>, Identity Number{' '}
              <Text style={styles.bold}>{content.testator.idNumber}</Text>, of{' '}
              {content.testator.address?.street}, {content.testator.address?.city},{' '}
              {content.testator.address?.state}, {content.testator.address?.postalCode}, being of
              sound mind and memory, do hereby declare this to be my Last Will and Testament.
            </Text>
          </View>
        )}

        {/* Family Information */}
        {content.marriage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{articleTitles.FAMILY_INFO}</Text>
            <Text style={styles.text}>
              Marital Status: <Text style={styles.bold}>{content.marriage.status}</Text>
            </Text>
            {content.marriage.spouses && content.marriage.spouses.length > 0 && (
              <>
                {content.marriage.spouses.map((spouse, idx) => (
                  <Text key={spouse.id || idx} style={styles.text}>
                    I am married to <Text style={styles.bold}>{spouse.fullName}</Text>
                    {spouse.idNumber && (
                      <Text> (ID: {spouse.idNumber})</Text>
                    )}
                    {spouse.dateOfMarriage && (
                      <Text>. We were married on {spouse.dateOfMarriage}</Text>
                    )}.
                  </Text>
                ))}
              </>
            )}
            {content.children && content.children.length > 0 && (
              <>
                <Text style={styles.text}>
                  I have {content.children.length}{' '}
                  {content.children.length === 1 ? 'child' : 'children'}:
                </Text>
                {content.children.map((child, index) => (
                  <Text key={child.id || index} style={styles.listItem}>
                    • {child.fullName}
                    {child.idNumber && ` (ID: ${child.idNumber})`}, born {child.dateOfBirth}
                    {child.isMinor && ' (minor)'}
                  </Text>
                ))}
              </>
            )}
          </View>
        )}

        {/* Appointment of Executor */}
        {content.executors && content.executors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{articleTitles.EXECUTORS}</Text>
            {content.executors
              .filter((e) => !e.isAlternate)
              .map((executor, index) => (
                <Text key={index} style={styles.text}>
                  I nominate and appoint <Text style={styles.bold}>{executor.fullName}</Text> (ID:{' '}
                  {executor.idNumber}) as the Executor of my estate.
                </Text>
              ))}
            {content.executors.filter((e) => e.isAlternate).length > 0 && (
              <Text style={styles.text}>
                Failing whom, I nominate{' '}
                {content.executors
                  .filter((e) => e.isAlternate)
                  .map((executor, index) => (
                    <Text key={index}>
                      <Text style={styles.bold}>{executor.fullName}</Text> (ID: {executor.idNumber})
                      {index <
                        content.executors.filter((e) => e.isAlternate).length - 1 && ', '}
                    </Text>
                  ))}{' '}
                as alternate Executor.
              </Text>
            )}
          </View>
        )}

        {/* Guardianship */}
        {content.guardians && content.guardians.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{articleTitles.GUARDIANS}</Text>
            {content.guardians
              .filter((g) => !g.isAlternate)
              .map((guardian, index) => (
                <Text key={index} style={styles.text}>
                  I appoint <Text style={styles.bold}>{guardian.fullName}</Text> (ID:{' '}
                  {guardian.idNumber}) as guardian of my minor{' '}
                  {guardian.forChildren.length === 1 ? 'child' : 'children'}:{' '}
                  {guardian.forChildren.join(', ')}.
                </Text>
              ))}
            {content.guardians.filter((g) => g.isAlternate).length > 0 && (
              <Text style={styles.text}>
                Failing whom, I appoint{' '}
                {content.guardians
                  .filter((g) => g.isAlternate)
                  .map((guardian, index) => (
                    <Text key={index}>
                      <Text style={styles.bold}>{guardian.fullName}</Text> (ID: {guardian.idNumber})
                    </Text>
                  ))}{' '}
                as alternate guardian.
              </Text>
            )}
          </View>
        )}

        {/* Minor Beneficiary Provisions */}
        {content.minorBeneficiaryProvisions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{articleTitles.MINOR_PROVISIONS}</Text>
            <Text style={styles.text}>{content.minorBeneficiaryProvisions.instructions}</Text>
          </View>
        )}

        {/* Specific Bequests */}
        {content.specificBequests && content.specificBequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{articleTitles.SPECIFIC_BEQUESTS}</Text>
            <Text style={styles.text}>I give, devise, and bequeath the following specific items:</Text>
            {content.specificBequests.map((bequest, index) => {
              const beneficiary = content.beneficiaries.find((b) => b.id === bequest.beneficiaryId)
              return (
                <Text key={index} style={styles.listItem}>
                  {index + 1}. {bequest.description} to{' '}
                  <Text style={styles.bold}>{beneficiary?.fullName || 'Unknown Beneficiary'}</Text>
                </Text>
              )
            })}
          </View>
        )}

        {/* Article VIII - Assets */}
        {content.assets && content.assets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE VIII - DECLARATION OF ASSETS</Text>
            <Text style={styles.text}>
              I declare that my estate consists of the following assets (values are estimates):
            </Text>
            {content.assets.map((asset, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {asset.description}
                {asset.estimatedValue && (
                  <Text> (Value: R{asset.estimatedValue.toLocaleString()})</Text>
                )}
              </Text>
            ))}
          </View>
        )}

        {/* Article IX - Liabilities */}
        {content.liabilities && content.liabilities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE IX - LIABILITIES</Text>
            <Text style={styles.text}>
              I direct that all my just debts, funeral expenses, and estate duties be paid from my
              estate before distribution:
            </Text>
            {content.liabilities.map((liability, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {liability.type}: {liability.creditor} - R
                {liability.amount.toLocaleString()}
              </Text>
            ))}
          </View>
        )}

        {/* Article X - Beneficiaries */}
        {content.beneficiaries && content.beneficiaries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE X - BENEFICIARIES</Text>
            <Text style={styles.text}>I nominate the following beneficiaries:</Text>
            {content.beneficiaries.map((beneficiary, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. <Text style={styles.bold}>{beneficiary.fullName}</Text>
                {beneficiary.idNumber && ` (ID: ${beneficiary.idNumber})`} - {beneficiary.relationship}
                {beneficiary.allocationPercentage && ` - ${beneficiary.allocationPercentage}% of residue`}
                {beneficiary.isMinor && ' (MINOR)'}
              </Text>
            ))}
          </View>
        )}

        {/* Residuary Estate */}
        {content.residuaryClause && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{articleTitles.RESIDUARY_ESTATE}</Text>
            <Text style={styles.text}>{content.residuaryClause}</Text>
          </View>
        )}

        {/* Article XII - Special Instructions */}
        {content.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE XII - SPECIAL INSTRUCTIONS</Text>
            <Text style={styles.text}>{content.specialInstructions}</Text>
          </View>
        )}

        {/* Article XIII - Funeral Wishes */}
        {content.funeralWishes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ARTICLE XIII - FUNERAL WISHES</Text>
            <Text style={styles.text}>
              Preference: <Text style={styles.bold}>{content.funeralWishes.preference}</Text>
            </Text>
            {content.funeralWishes.location && (
              <Text style={styles.text}>Location: {content.funeralWishes.location}</Text>
            )}
            {content.funeralWishes.specificInstructions && (
              <Text style={styles.text}>Instructions: {content.funeralWishes.specificInstructions}</Text>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Attestation Clause */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{articleTitles.ATTESTATION}</Text>
          <Text style={styles.text}>
            {content.attestationClause ||
              `SIGNED at ${content.placeExecuted || '[City]'} on this ${content.dateExecuted || '[Date]'}, in the presence of the undersigned witnesses, who attest and bear witness to the signing hereof by me and by each other in the presence of me and of each other, all being present together at the same time.`}
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.text}>
            <Text style={styles.bold}>TESTATOR SIGNATURE</Text>
          </Text>
          <Text style={styles.text}>{content.testator?.fullName}</Text>
          <Text style={styles.text}>ID Number: {content.testator?.idNumber}</Text>
          <Text style={styles.text}>Date: {content.dateExecuted || '_______________'}</Text>
        </View>

        {/* Witnesses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AS WITNESSES:</Text>
          <Text style={{ ...styles.text, fontSize: 9, fontStyle: 'italic', marginBottom: 12 }}>
            NOTE: Witnesses CANNOT be beneficiaries, executors, guardians, or spouses of any of the
            above. All witnesses must be 14+ years old and present at the same time.
          </Text>

          {content.witnesses && content.witnesses.length > 0 ? (
            content.witnesses.map((witness, index) => (
              <View key={index} style={{ marginBottom: 20 }}>
                <Text style={styles.text}>
                  <Text style={styles.bold}>WITNESS {index + 1}:</Text>
                </Text>
                <View style={styles.signatureLine} />
                <Text style={styles.text}>Name: {witness.fullName}</Text>
                {witness.idNumber && <Text style={styles.text}>ID Number: {witness.idNumber}</Text>}
                <Text style={styles.text}>
                  Address: {witness.address?.street}, {witness.address?.city},{' '}
                  {witness.address?.state}
                </Text>
                {witness.occupation && <Text style={styles.text}>Occupation: {witness.occupation}</Text>}
                <Text style={styles.text}>Date: {witness.dateWitnessed || '_______________'}</Text>
              </View>
            ))
          ) : (
            <>
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.text}>
                  <Text style={styles.bold}>WITNESS 1:</Text>
                </Text>
                <View style={styles.signatureLine} />
                <Text style={styles.text}>Name: ___________________________________</Text>
                <Text style={styles.text}>ID Number: ___________________________________</Text>
                <Text style={styles.text}>Address: ___________________________________</Text>
                <Text style={styles.text}>Date: _______________</Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={styles.text}>
                  <Text style={styles.bold}>WITNESS 2:</Text>
                </Text>
                <View style={styles.signatureLine} />
                <Text style={styles.text}>Name: ___________________________________</Text>
                <Text style={styles.text}>ID Number: ___________________________________</Text>
                <Text style={styles.text}>Address: ___________________________________</Text>
                <Text style={styles.text}>Date: _______________</Text>
              </View>
            </>
          )}
        </View>

        {/* Commissioner of Oath Certification (if clause is selected) */}
        {(() => {
          const commissionerClause = content.optionalClauses?.find(
            (c) => c.clauseType === 'commissioner-of-oath-attestation' && c.isSelected
          );

          if (!commissionerClause) return null;

          return (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                COMMISSIONER OF OATHS CERTIFICATION
              </Text>
              <Text style={styles.text}>
                I, _____________________________________, Registration Number _____________________,
                a Commissioner of Oaths duly appointed in the Republic of South Africa, do hereby
                certify that this Last Will and Testament was signed by the testator in my presence
                and in the presence of the witnesses named above.
              </Text>
              <Text style={styles.text}>
                I further certify that the testator appeared to be of sound mind and under no undue
                influence or coercion, and that all signatures were affixed in the presence of all parties.
              </Text>
              <View style={[styles.signatureBlock, { marginTop: 15 }]}>
                <View style={styles.signatureLine} />
                <Text style={styles.text}>Commissioner of Oaths Signature</Text>
                <Text style={styles.text}>Name: ___________________________________</Text>
                <Text style={styles.text}>ID Number: ___________________________________</Text>
                <Text style={styles.text}>Registration Number: ___________________________________</Text>
                <Text style={styles.text}>Date: ___________________________________</Text>
                <Text style={styles.text}>Place: ___________________________________</Text>
              </View>
            </View>
          );
        })()}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Fennec Will Builder on {new Date(createdAt).toLocaleDateString()}</Text>
          <Text style={{ marginTop: 5, fontWeight: 'bold' }}>
            ⚠ This is a computer-generated document template.
          </Text>
          <Text style={{ marginTop: 3 }}>
            IMPORTANT: This Will MUST be printed and signed with PHYSICAL signatures. Consult with a
            South African attorney to ensure full compliance with the Wills Act 7 of 1953 and current
            legal requirements.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
