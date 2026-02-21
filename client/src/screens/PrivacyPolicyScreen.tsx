import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../styles/theme';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📄 Política de Privacidad</Text>
      <Text style={styles.date}>Última actualización: 21 de febrero de 2026</Text>

      <Text style={styles.sectionTitle}>1. Información del responsable</Text>
      <Text style={styles.text}>La presente Política de Privacidad regula el tratamiento de datos personales realizado a través de la aplicación Soccer Legends (en adelante, “la App”).{"\n\n"}Responsable del tratamiento:{"\n\n"}Jose Alberto Arruego{"\n"}Correo electrónico: josealberto@arruego.com{"\n"}País: España{"\n\n"}La App es una aplicación de apoyo a un juego de mesa y está destinada a todos los públicos.</Text>

      <Text style={styles.sectionTitle}>2. Datos personales recopilados</Text>
      <Text style={styles.text}>La App recopila exclusivamente los siguientes datos personales:{"\n\n"}- Dirección de correo electrónico{"\n"}- Nombre de usuario{"\n"}- Contraseña (almacenada de forma cifrada){"\n\n"}La App no recopila datos de ubicación, contactos, imágenes, micrófono, cámara ni ningún otro dato del dispositivo.</Text>

      <Text style={styles.sectionTitle}>3. Finalidad del tratamiento</Text>
      <Text style={styles.text}>Los datos personales se utilizan únicamente para:{"\n\n"}- Crear y gestionar cuentas de usuario{"\n"}- Permitir el acceso mediante inicio de sesión{"\n"}- Garantizar el correcto funcionamiento técnico de la App{"\n\n"}No se utilizan los datos con fines comerciales, publicitarios ni de elaboración de perfiles.</Text>

      <Text style={styles.sectionTitle}>4. Base legal del tratamiento</Text>
      <Text style={styles.text}>El tratamiento de los datos se basa en el consentimiento del usuario al registrarse en la App.</Text>

      <Text style={styles.sectionTitle}>5. Conservación de los datos</Text>
      <Text style={styles.text}>Los datos se conservarán mientras la cuenta permanezca activa.{"\n\n"}El usuario puede solicitar en cualquier momento la eliminación de su cuenta enviando un correo electrónico a:{"\n\n"}josealberto@arruego.com</Text>

      <Text style={styles.sectionTitle}>6. Encargados del tratamiento</Text>
      <Text style={styles.text}>Para el funcionamiento técnico de la App, se utilizan proveedores tecnológicos externos que pueden tratar datos personales como encargados del tratamiento:{"\n\n"}- Servicios de alojamiento e infraestructura en Render{"\n"}- Servicios de base de datos y autenticación en Supabase{"\n\n"}Estos proveedores actúan bajo sus propias políticas de seguridad y cumplimiento normativo.</Text>

      <Text style={styles.sectionTitle}>7. Cesión de datos</Text>
      <Text style={styles.text}>No se venden ni ceden datos personales a terceros.{"\n\n"}Los datos no se transfieren fuera del Espacio Económico Europeo salvo que los proveedores tecnológicos ofrezcan garantías adecuadas conforme al Reglamento (UE) 2016/679 (RGPD).</Text>

      <Text style={styles.sectionTitle}>8. Derechos del usuario</Text>
      <Text style={styles.text}>De acuerdo con el Reglamento General de Protección de Datos (RGPD), el usuario puede ejercer los siguientes derechos:{"\n\n"}- Acceso{"\n"}- Rectificación{"\n"}- Supresión{"\n"}- Limitación del tratamiento{"\n\n"}Para ejercer estos derechos puede contactar en:{"\n\n"}josealberto@arruego.com</Text>

      <Text style={styles.sectionTitle}>9. Modificaciones</Text>
      <Text style={styles.text}>El responsable se reserva el derecho de modificar la presente Política de Privacidad para adaptarla a novedades legislativas o técnicas.{"\n"}Cualquier modificación será publicada en esta misma página.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
    color: Colors.primary,
  },
  text: {
    fontSize: 15,
    color: Colors.gray900,
    marginBottom: 8,
    lineHeight: 22,
  },
});
