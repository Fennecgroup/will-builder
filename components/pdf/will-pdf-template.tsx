import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { WillContent } from '@/lib/types/will'

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  text: {
    marginBottom: 5,
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 'bold',
  },
  listItem: {
    marginLeft: 20,
    marginBottom: 5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 15,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    fontSize: 10,
    color: '#666',
  },
})

interface WillPDFTemplateProps {
  title: string
  content: WillContent
  createdAt: Date
}

export function WillPDFTemplate({ title, content, createdAt }: WillPDFTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LAST WILL AND TESTAMENT</Text>
          <Text style={styles.subtitle}>{title}</Text>
        </View>

        {/* Testator Information */}
        {content.testator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>I. TESTATOR INFORMATION</Text>
            <Text style={styles.text}>
              I, <Text style={styles.bold}>{content.testator.fullName}</Text>, born on{' '}
              {content.testator.dateOfBirth}, residing at {content.testator.address?.street},{' '}
              {content.testator.address?.city}, {content.testator.address?.state}{' '}
              {content.testator.address?.postalCode}, being of sound mind and disposing memory, do
              hereby make, publish, and declare this to be my Last Will and Testament.
            </Text>
          </View>
        )}

        {/* Marriage Information */}
        {content.marriage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>II. FAMILY INFORMATION</Text>
            <Text style={styles.text}>
              Marital Status: <Text style={styles.bold}>{content.marriage.status}</Text>
            </Text>
            {content.marriage.spouse && (
              <Text style={styles.text}>
                Spouse: <Text style={styles.bold}>{content.marriage.spouse.fullName}</Text>
              </Text>
            )}
            {content.marriage.numberOfChildren && content.marriage.numberOfChildren > 0 && (
              <Text style={styles.text}>
                Number of Children: <Text style={styles.bold}>{content.marriage.numberOfChildren}</Text>
              </Text>
            )}
          </View>
        )}

        {/* Assets */}
        {content.assets && content.assets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>III. ASSETS</Text>
            {content.assets.map((asset, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {asset.type}: {asset.description}
                {asset.estimatedValue && ` (Value: $${asset.estimatedValue.toLocaleString()})`}
              </Text>
            ))}
          </View>
        )}

        {/* Beneficiaries */}
        {content.beneficiaries && content.beneficiaries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>IV. BENEFICIARIES</Text>
            {content.beneficiaries.map((beneficiary, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {beneficiary.fullName} - {beneficiary.relationship}
                {beneficiary.allocationPercentage && ` (${beneficiary.allocationPercentage}% of estate)`}
              </Text>
            ))}
          </View>
        )}

        {/* Executors */}
        {content.executors && content.executors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>V. EXECUTORS</Text>
            {content.executors.map((executor, index) => (
              <Text key={index} style={styles.listItem}>
                {executor.isAlternate ? 'Alternate' : 'Primary'} Executor:{' '}
                {executor.fullName}
              </Text>
            ))}
          </View>
        )}

        {/* Guardians */}
        {content.guardians && content.guardians.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>VI. GUARDIANS</Text>
            {content.guardians.map((guardian, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {guardian.fullName} - {guardian.relationship}
              </Text>
            ))}
          </View>
        )}

        {/* Funeral Wishes */}
        {content.funeralWishes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>VII. FUNERAL WISHES</Text>
            {content.funeralWishes.preference && (
              <Text style={styles.text}>
                Preference: <Text style={styles.bold}>{content.funeralWishes.preference}</Text>
              </Text>
            )}
            {content.funeralWishes.specificInstructions && (
              <Text style={styles.text}>
                Instructions: {content.funeralWishes.specificInstructions}
              </Text>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Signature Section */}
        <View style={styles.section}>
          <Text style={styles.text}>
            IN WITNESS WHEREOF, I have hereunto set my hand this _____ day of __________, 20___.
          </Text>
          <Text style={{ marginTop: 30, marginBottom: 5 }}>
            _________________________________
          </Text>
          <Text style={styles.text}>{content.testator?.fullName || 'Testator Signature'}</Text>
        </View>

        {/* Witnesses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WITNESSES</Text>
          <Text style={styles.text}>
            The foregoing instrument was signed, published, and declared by the Testator to be their
            Last Will and Testament in our presence, and we, at their request and in their presence,
            and in the presence of each other, have subscribed our names as witnesses.
          </Text>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.text}>Witness 1:</Text>
            <Text style={{ marginTop: 10, marginBottom: 5 }}>
              _________________________________
            </Text>
            <Text style={styles.text}>Signature</Text>
            <Text style={{ marginTop: 5 }}>
              _________________________________
            </Text>
            <Text style={styles.text}>Printed Name</Text>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.text}>Witness 2:</Text>
            <Text style={{ marginTop: 10, marginBottom: 5 }}>
              _________________________________
            </Text>
            <Text style={styles.text}>Signature</Text>
            <Text style={{ marginTop: 5 }}>
              _________________________________
            </Text>
            <Text style={styles.text}>Printed Name</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Fennec Will Builder on {new Date(createdAt).toLocaleDateString()}</Text>
          <Text style={{ marginTop: 5 }}>
            This is a computer-generated document. Please consult with a legal professional to ensure
            compliance with local laws.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
