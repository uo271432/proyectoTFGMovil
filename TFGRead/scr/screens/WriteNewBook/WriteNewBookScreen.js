import {
  SafeAreaView, StyleSheet, Text, View, BackHandler, TouchableOpacity, ImageBackground, Modal, StatusBar, ScrollView, Image, TextInput, FlatList, LogBox
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect, useEffect, useState } from "react";
import LottieView from 'lottie-react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { crearLibroStorage } from "../../hooks/Storage";
import { cambiarPortadadeLibro, crearLibroFirebase } from "../../hooks/FirebaseLibros";
import { getCategorias } from "../../hooks/CategoriasFirebase";
import { getUserAuth } from "../../hooks/Auth/Auth";
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from "react-native-dropdown-picker";

function WriteNewBookScreen() {

  const navigation = useNavigation();
  const [image, setImage] = useState("https://leadershiftinsights.com/wp-content/uploads/2019/07/no-book-cover-available.jpg");
  const [email, setEmail] = useState("");
  const [tituloLibro, setTituloLibro] = useState("");
  const [descripcionLibro, setDescripcionLibro] = useState("");
  //ETIQUETAS:
  const [textoEtiqueta, setTextoEtiqueta] = useState("");
  const [etiquetas, setEtiquetas] = useState([]);
  //CATEGORIAS:

  const [categoriasFirebase, setCategoriasFirebase] = useState([]);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [value, setValue] = useState([]); // Multiple


  //MODALES
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisibleTitulo, setModalVisibleTitulo] = useState(false);
  const [isModalVisibleDescripcion, setModalVisibleDescripcion] = useState(false);
  const [isModalVisibleImagen, setModalVisibleImagen] = useState(false);
  const [isModalVisibleCategoria, setModalVisibleCategoria] = useState(false);

  useEffect(() => {
    setModalVisible(false);
    fetchData();
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"])
    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [email]);

  const backAction = async () => {
    navigation.push("write", {

    });
  };
  const goBack = () => {
    navigation.replace("write");
  }
  const pickImageF = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.uri != undefined) {
      setImage(result.uri);
    }
  };

  const contarPalabrasDescipcion = (texto, length) => {
    if (texto.length < length) {
      setDescripcionLibro(texto)
    }
  }

  const contarPalabrasEtiqueta = (texto, length) => {
    if (texto.length < length) {
      setTextoEtiqueta(texto)
    }
  }

  const añadirEtiquetas = (texto) => {
    etiquetas.push(
      texto);
    setTextoEtiqueta("");

  }

  const eliminarEtiquetas = (texto) => {
    let e = etiquetas.filter(function (obj) {
      return obj !== texto;
    })
    setEtiquetas(e)
  }


  const assertCrearLibroTitulo = () => {
    if (tituloLibro.length == 0 || tituloLibro.trim().length == 0) {
      setModalVisibleTitulo(true);
      return true;
    }
    return false;
  }
  const assertCrearLibroDescripcion = () => {
    if (descripcionLibro.length == 0 || descripcionLibro.trim().length == 0) {
      setModalVisibleDescripcion(true);
      return true;
    }
    return false;
  }

  const assertCrearLibroImagen = () => {

    if (image == "https://leadershiftinsights.com/wp-content/uploads/2019/07/no-book-cover-available.jpg") {
      setModalVisibleImagen(true);
      return true;
    }
    return false;
  }
  const assertCrearLibroCategoria = () => {

    if (value.length == 0) {
      setModalVisibleCategoria(true);
      return true;
    }
    return false;
  }
  const cambiarEstadosPorNombre = () => {
    let categoria = [];
    let i;
    let j;
    for (i = 0; i < categoriasFirebase.length; i++) {

      for (j = 0;j < value.length; j++) {
        if (categoriasFirebase[i].value == value[j]) {
          categoria.push({
            Nombre: categoriasFirebase[i].value,
            Color: categoriasFirebase[i].color,
          });
        }

      }
    }

    return categoria;
  }
  const crearLibro = async () => {

    setModalVisible(true);
    if (!assertCrearLibroTitulo() && !assertCrearLibroDescripcion() && !assertCrearLibroImagen() && !assertCrearLibroCategoria()) {
      let categoria = cambiarEstadosPorNombre();
      let id = await crearLibroFirebase(tituloLibro, descripcionLibro, email, etiquetas, categoria);
      let urlPortada = await crearLibroStorage(image, email, id)
      await cambiarPortadadeLibro(id, urlPortada)

      navigation.navigate("writeChapter", {
        bookId: id,
      });
    }
    setModalVisible(false)
  }
  const fetchData = async () => {
    setEmail(await getUserAuth());
    setCategoriasFirebase(await getCategorias());
  }


  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);



  function renderEtiquetas(item, index) {
    return (
      <View
        style={{
          borderColor: "#8EAF20",
          marginHorizontal: 5,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderWidth: 1,
          borderRadius: 15,
          backgroundColor: `white`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          flexDirection: "row"
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: "black",
            fontWeight: "bold",
          }}
        >
          {item}
        </Text>
        <TouchableOpacity
          style={{
            marginLeft: 10,

          }}
          onPress={e => eliminarEtiquetas(item.Nombre)}
        >
          <AntDesign name="closecircleo" size={20} color="black" />
        </TouchableOpacity>
      </View>
    );
  }

  return (

    <SafeAreaView style={{
      flex: 1,
      backgroundColor: isModalVisible ? "#A7A7A7" : "white",
    }}>

      <Modal
        animationType="fade"
        visible={isModalVisible}
        transparent
      >
        <View style={{
          marginTop: "auto",
          marginBottom: "auto",
          marginLeft: "auto",
          marginRight: "auto",
          height: 150,
          borderColor: "#8EAF20",
          borderRadius: 20,
          borderWidth: 2, backgroundColor: 'white', alignItems: 'center', justifyContent: "center",
          shadowColor: "black",
          shadowOpacity: 0.89,
          shadowOffset: { width: 0, height: 9 },
          shadowRadius: 10,
          elevation: 12,
        }}>
          <LottieView style={styles.lottieModalWait}
            source={require('../../../assets/animations/waitFunction.json')} autoPlay loop />
          <Text style={styles.textWait}>Cargando.....</Text>
        </View>
      </Modal>
      {isModalVisibleTitulo &&

        <Modal
          animationType="fade"
          isVisible={isModalVisibleTitulo}
          transparent


        >
          <View style={{
            marginTop: "auto",
            marginBottom: "auto",
            marginLeft: "auto",
            marginRight: "auto",
            height: 200,
            borderColor: "#8EAF20",
            borderRadius: 20,
            borderWidth: 2, backgroundColor: 'white', alignItems: 'center', justifyContent: "center",
            shadowColor: "black",
            shadowOpacity: 0.89,
            shadowOffset: { width: 0, height: 9 },
            shadowRadius: 10,
            elevation: 12,
          }}>
            <AntDesign name="warning" size={35} color="#E39801" />
            <Text style={{
              marginVertical: 20,
              marginHorizontal: 20,
            }}>NO puedes dejar un libro sin titulo</Text>

            <TouchableOpacity
              style={{
                width: "50%",
                padding: 12,
                borderRadius: 20,
                alignItems: "center",
                marginLeft: "auto",
                marginRight: "auto",
                backgroundColor: isModalVisible ? "#8D8D8D" : "#B00020",

                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.8,
                shadowRadius: 6.00,
                elevation: 15,
              }}
              onPress={e => setModalVisibleTitulo(!isModalVisibleTitulo)}
            >
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "white" }}>
                Aceptar
              </Text>
            </TouchableOpacity>

          </View>
        </Modal>
      }



      <Modal
        backdropColor={'green'}
        backdropOpacity={1}
        animationType="fade"
        visible={isModalVisibleDescripcion}
        transparent>

        <View style={{
          marginTop: "auto",
          marginBottom: "auto",
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
          borderColor: "#8EAF20",
          borderRadius: 20,
          borderWidth: 2, backgroundColor: 'white', alignItems: 'center', justifyContent: "center",
          shadowColor: "black",
          shadowOpacity: 0.89,
          shadowOffset: { width: 0, height: 9 },
          shadowRadius: 10,
          elevation: 12,
        }}>
          <AntDesign name="warning" size={35} color="#E39801" />
          <Text style={{
            marginVertical: 20,
            marginHorizontal: 20,
          }}>NO puedes dejar un libro sin descripción</Text>

          <TouchableOpacity
            style={{
              width: "50%",
              padding: 12,
              borderRadius: 20,
              alignItems: "center",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: isModalVisible ? "#8D8D8D" : "#B00020",

              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.8,
              shadowRadius: 6.00,
              elevation: 15,
            }}
            onPress={e => setModalVisibleDescripcion(!isModalVisibleDescripcion)}
          >
            <Text style={{ fontSize: 15, fontWeight: "bold", color: "white" }}>
              Aceptar
            </Text>
          </TouchableOpacity>

        </View>
      </Modal>

      {isModalVisibleImagen &&

        <Modal
          backdropColor={'green'}
          backdropOpacity={1}
          animationType="fade"
          isVisible={isModalVisibleImagen}
          transparent
        >

          <View style={{
            marginTop: "auto",
            marginBottom: "auto",
            marginLeft: "auto",
            marginRight: "auto",
            height: 200,
            borderColor: "#8EAF20",
            borderRadius: 20,
            borderWidth: 2, backgroundColor: 'white', alignItems: 'center', justifyContent: "center",
            shadowColor: "black",
            shadowOpacity: 0.89,
            shadowOffset: { width: 0, height: 9 },
            shadowRadius: 10,
            elevation: 12,
          }}>
            <AntDesign name="warning" size={35} color="#E39801" />
            <Text style={{
              marginVertical: 20,
              marginHorizontal: 20,
            }}>NO puedes dejar un libro sin caratula</Text>

            <TouchableOpacity
              style={{
                width: "50%",
                padding: 12,
                borderRadius: 20,
                alignItems: "center",
                marginLeft: "auto",
                marginRight: "auto",
                backgroundColor: isModalVisible ? "#8D8D8D" : "#B00020",

                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.8,
                shadowRadius: 6.00,
                elevation: 15,
              }}
              onPress={e => setModalVisibleImagen(!isModalVisibleImagen)}
            >
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "white" }}>
                Aceptar
              </Text>
            </TouchableOpacity>

          </View>
        </Modal>
      }

      <Modal
        animationType="fade"
        visible={isModalVisibleCategoria}
        transparent
      >

        <View style={{
          marginTop: "auto",
          marginBottom: "auto",
          marginLeft: "auto",
          marginRight: "auto",
          height: 200,
          borderColor: "#8EAF20",
          borderRadius: 20,
          borderWidth: 2, backgroundColor: 'white', alignItems: 'center', justifyContent: "center",
          shadowColor: "black",
          shadowOpacity: 0.89,
          shadowOffset: { width: 0, height: 9 },
          shadowRadius: 10,
          elevation: 12,
        }}>
          <AntDesign name="warning" size={35} color="#E39801" />
          <Text style={{
            marginVertical: 20,
            marginHorizontal: 20,
          }}>NO puedes dejar un libro sin categoría</Text>

          <TouchableOpacity
            style={{
              width: "50%",
              padding: 12,
              borderRadius: 20,
              alignItems: "center",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: isModalVisible ? "#8D8D8D" : "#B00020",

              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.8,
              shadowRadius: 6.00,
              elevation: 15,
            }}
            onPress={e => setModalVisibleCategoria(!isModalVisibleCategoria)}
          >
            <Text style={{ fontSize: 15, fontWeight: "bold", color: "white" }}>
              Aceptar
            </Text>
          </TouchableOpacity>

        </View>
      </Modal>

      {/* Pantalla normal*/}
      {/* Head */}
      <StatusBar
        translucent={false}
        backgroundColor="white"
        barStyle="dark-content"
      />
      {/* Head Cosas */}
      <View style={styles.head}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" style={{ marginTop: "auto", marginRight: 10, marginLeft: 10, }} />
          </TouchableOpacity>
          {/*nombre e inicio*/}
          <View>
            <Text style={styles.fontTitulo}>Información nuevo libro</Text>
          </View>
        </View>
      </View>

      {/* Contenedor Principal*/}
      <ScrollView style={{ flexGrow: 0 }}>
        <View
          style={{
            flex: 1,
            marginVertical: 20,
            marginHorizontal: 30
          }}
        >

          {/* Portada del libro */}
          <View style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}>
            <Text style={{ fontSize: 15, fontWeight: "bold", color: "black", marginTop: 10, marginBottom: 10, borderBottomColor: "#8EAF20", borderBottomWidth: 3, width: "60%" }}>
              Cambiar portada del libro
            </Text>

            {/* Imagenes Books nuevos blur */}
            <View
              style={{
                elevation: 12,
                position: "absolute",
                top: 120,
                borderRadius: 15,
                overflow: "hidden",
                opacity: 0.3,
              }}
            >
              <Image
                blurRadius={15}
                style={{ width: 130, height: 80 }}
                source={{ uri: `${image}` }}
              />
            </View>
            {/* Imagenes Books nuevos */}
            <TouchableOpacity
              style={{
                marginHorizontal: 10,
              }}
              onPress={e => pickImageF()}
            >
              <ImageBackground
                source={{ uri: `${image}` }}
                style={{
                  width: 110,
                  height: 150,
                  borderRadius: 15,
                  overflow: "hidden",
                }}
              ></ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Titulo del libro*/}
          <View style={{ marginTop: 10, }}>
            <Text style={{ fontSize: 15, fontWeight: "bold", color: "black", marginTop: 10, marginBottom: 10, borderBottomColor: "#8EAF20", borderBottomWidth: 3, width: "50%" }}>
              Título del libro
            </Text>
            <TextInput
              placeholder="Título "
              placeholderTextColor="black"
              value={tituloLibro}
              onChangeText={(text) => setTituloLibro(text)}
              style={{
                marginRight: 20,
                marginLeft: 20,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                color: "#429EBD", backgroundColor: isModalVisible ? "#8D8D8D" : "#f8f8f8"
              }}
            ></TextInput>
          </View>
          {/* Descripción del libro */}
          <View style={{ marginTop: 10, }}>
            <Text style={{ fontSize: 15, fontWeight: "bold", color: "black", marginTop: 10, marginBottom: 10, borderBottomColor: "#8EAF20", borderBottomWidth: 3, width: "50%" }}>
              Descripción del libro
            </Text>
            <TextInput
              placeholder="Descripción"
              placeholderTextColor="black"
              value={descripcionLibro}
              onChangeText={(text) => contarPalabrasDescipcion(text, 500)}
              style={{
                marginRight: 20,
                marginLeft: 20,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                color: "#429EBD", backgroundColor: isModalVisible ? "#8D8D8D" : "#f8f8f8"
              }}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            ></TextInput>
            <Text style={{
              marginLeft: "80%"
            }}> {descripcionLibro.length}/500</Text>
          </View>

          {/* Categorías */}
          <View>
            <Text style={{ fontSize: 15, fontWeight: "bold", color: "black", marginTop: 10, marginBottom: 5, borderBottomColor: "#8EAF20", borderBottomWidth: 3, width: "50%" }}>
              Categorías
            </Text>
            <DropDownPicker
              style={styles.dropdown}
              open={estadoOpen}
              value={value}
              items={categoriasFirebase}
              setOpen={setEstadoOpen}
              setValue={setValue}
              setItems={setCategoriasFirebase}
              placeholder="Seleccionar categorias"
              placeholderStyle={styles.placeholderStyles}
              dropDownContainerStyle={styles.dropDownContainerStyle}
              scrollViewProps={{
                decelerationRate: "fast"
              }}
              zIndex={3000}
              zIndexInverse={1000}
              multiple={true}
              min={1}
              max={3}
              mode="BADGE"
            />
            {/* Etiquetas */}
            <View>
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "black", marginTop: 10, marginBottom: 5, borderBottomColor: "#8EAF20", borderBottomWidth: 3, width: "50%" }}>
                Etiquetas
              </Text>

              {/* Etiquetas explorar */}

              <View>
                <FlatList
                  contentContainerStyle={{ paddingTop: 5 }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={etiquetas}
                  keyExtractor={(item, index) => {
                    return index.toString();
                  }}
                  renderItem={({ item, index }) => renderEtiquetas(item, index)}
                ></FlatList>
              </View>

              <TextInput
                placeholder="Título "
                placeholderTextColor="black"
                value={textoEtiqueta}
                onChangeText={(text) => contarPalabrasEtiqueta(text, 50)}
                style={{
                  marginRight: 20,
                  marginLeft: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 5,
                  borderRadius: 10,
                  color: "#429EBD", backgroundColor: isModalVisible ? "#8D8D8D" : "#f8f8f8"
                }}
              ></TextInput>
              <Text style={{
                marginLeft: "80%"
              }}> {textoEtiqueta.length}/50</Text>
              <TouchableOpacity
                style={{
                  marginHorizontal: 10,
                  width: "50%",
                  borderRadius: 20,
                  alignItems: "center",
                  backgroundColor: isModalVisible ? "#8D8D8D" : "#E39801",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 12,
                  },
                  shadowOpacity: 0.8,
                  shadowRadius: 6.00,
                  elevation: 5,
                }}
                onPress={e => añadirEtiquetas(textoEtiqueta)}
              >
                <Text style={{ fontSize: 15, fontWeight: "bold", color: "white" }}>
                  Añadir etiqueta
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                width: "50%",
                marginTop: 25,
                padding: 12,
                borderRadius: 20,
                alignItems: "center",
                marginLeft: "auto",
                marginRight: "auto",
                backgroundColor: isModalVisible ? "#8D8D8D" : "#E39801",

                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.8,
                shadowRadius: 6.00,
                elevation: 5,
              }}
              onPress={e => crearLibro()}
            >
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "white" }}>
                Siguiente
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#429EBD",
    borderBottomRightRadius: 500,
    height: 70,

  },
  textWait: {
    marginBottom: 10,
    fontSize: 15,
    color: "black",
    fontWeight: "bold",
    marginLeft: "auto",
    marginRight: "auto"
  },
  lottieModalWait: {
    marginTop: "auto",
    marginBottom: "auto",
    marginLeft: "auto",
    marginRight: "auto",
    height: '100%',
    width: '100%'
  },
  fontTitulo: {
    paddingTop: 10,
    fontWeight: "bold",
    color: "white",
    fontSize: 25,
  },
  containerPrincipal: {
    backgroundColor: "white",
  },
  modalContainer: {
    marginLeft: "auto",
    marginRight: "auto",
    alignItems: 'center',
    height: '100%', width: '100%',
  },
  modalView: {
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    top: 100,
    width: '85%', height: 50,
    backgroundColor: 'white',
    borderRadius: 8
  },
  textStyle: {
    color: 'black',
    textAlign: 'center',
    fontSize: 12,
    marginLeft: 20
  },
  dropdown: {
    borderColor: "#8EAF20",
    width: "80%",
  },
  dropDownContainerStyle: {
    borderColor: "#8EAF20",
    width: "70%",

  },
  placeholderStyles: {
    color: "grey",
  },
});
export default WriteNewBookScreen